import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

describe('Prisma domain', () => {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let userId: string;
  let secondUserId: string;
  let workspaceId: string;
  let secondWorkspaceId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        emailNormalized: `owner-${suffix}@example.com`,
        displayName: 'Domain owner',
      },
    });
    const secondUser = await prisma.user.create({
      data: {
        emailNormalized: `member-${suffix}@example.com`,
        displayName: 'Domain member',
      },
    });
    userId = user.id;
    secondUserId = secondUser.id;
    const workspace = await prisma.workspace.create({
      data: { name: `Workspace ${suffix}`, createdById: userId },
    });
    const secondWorkspace = await prisma.workspace.create({
      data: { name: `Second workspace ${suffix}`, createdById: secondUserId },
    });
    workspaceId = workspace.id;
    secondWorkspaceId = secondWorkspace.id;
    await prisma.membership.create({
      data: { userId, workspaceId, role: 'admin' },
    });
    await prisma.membership.create({
      data: { userId: secondUserId, workspaceId, role: 'member' },
    });
    await prisma.membership.create({
      data: { userId: userId, workspaceId: secondWorkspaceId, role: 'member' },
    });
    const project = await prisma.project.create({
      data: {
        name: `Project ${suffix}`,
        description: 'Integration project',
        workspaceId,
        createdById: userId,
      },
    });
    projectId = project.id;
    const task = await prisma.task.create({
      data: {
        projectId,
        createdById: secondUserId,
        title: `Task ${suffix}`,
        description: 'Persist the domain',
        acceptanceCriteria: 'The relation can be loaded',
        codeContext: 'const answer = 42',
      },
    });
    taskId = task.id;
  });

  afterAll(async () => {
    await prisma.execution.deleteMany({ where: { taskId } });
    await prisma.task.deleteMany({ where: { id: taskId } });
    await prisma.project.deleteMany({ where: { id: projectId } });
    await prisma.membership.deleteMany({
      where: { userId: { in: [userId, secondUserId] } },
    });
    await prisma.workspace.deleteMany({
      where: { id: { in: [workspaceId, secondWorkspaceId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, secondUserId] } },
    });
    await prisma.$disconnect();
  });

  it('persists the workspace, membership, project, task and execution graph', async () => {
    const execution = await prisma.execution.create({
      data: {
        taskId,
        requestedById: userId,
        idempotencyKey: `first-${suffix}`,
        inputSnapshot: {
          title: `Task ${suffix}`,
          criteria: 'The relation can be loaded',
        },
      },
    });

    const result = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        memberships: { include: { user: true } },
        projects: { include: { tasks: { include: { executions: true } } } },
      },
    });

    expect(result?.memberships).toHaveLength(2);
    expect(result?.projects[0]?.tasks[0]?.executions[0]?.id).toBe(execution.id);
    expect(result?.projects[0]?.tasks[0]?.status).toBe('todo');
  });

  it('enforces normalized email, membership, and per-task idempotency uniqueness', async () => {
    await expect(
      prisma.user.create({
        data: {
          emailNormalized: `owner-${suffix}@example.com`,
          displayName: 'Duplicate',
        },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.membership.create({
        data: { userId, workspaceId, role: 'member' },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.execution.create({
        data: {
          taskId,
          requestedById: userId,
          idempotencyKey: `first-${suffix}`,
          inputSnapshot: { duplicate: true },
        },
      }),
    ).rejects.toThrow();
  });

  it('allows one active execution per task and permits a terminal retry', async () => {
    await expect(
      prisma.execution.create({
        data: {
          taskId,
          requestedById: secondUserId,
          idempotencyKey: `second-${suffix}`,
          inputSnapshot: { attempt: 2 },
        },
      }),
    ).rejects.toThrow();

    const first = await prisma.execution.findFirstOrThrow({
      where: { taskId, idempotencyKey: `first-${suffix}` },
    });
    await prisma.execution.update({
      where: { id: first.id },
      data: {
        status: 'failed',
        errorMessage: 'Provider timeout',
        finishedAt: new Date(),
      },
    });
    const retry = await prisma.execution.create({
      data: {
        taskId,
        requestedById: secondUserId,
        idempotencyKey: `second-${suffix}`,
        inputSnapshot: { attempt: 2 },
        status: 'succeeded',
        output: { plan: 'Retry completed' },
        finishedAt: new Date(),
        useful: true,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });
    expect(retry.status).toBe('succeeded');
    expect(retry.useful).toBe(true);
  });

  it('rejects orphan references and retains records through logical removal', async () => {
    await expect(
      prisma.project.create({
        data: {
          name: 'Orphan project',
          workspaceId: '00000000-0000-0000-0000-000000000099',
          createdById: userId,
        },
      }),
    ).rejects.toThrow();
    await prisma.membership.update({
      where: { userId_workspaceId: { userId: secondUserId, workspaceId } },
      data: { removedAt: new Date() },
    });
    const task = await prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: { executions: true, createdBy: true },
    });
    expect(task.executions).toHaveLength(2);
    expect(task.createdBy.id).toBe(secondUserId);
  });

  it('rejects empty required values and incomplete reviews', async () => {
    await expect(
      prisma.task.create({
        data: {
          projectId,
          createdById: userId,
          title: ' ',
          description: 'Description',
          acceptanceCriteria: 'Criteria',
        },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.execution.create({
        data: {
          taskId,
          requestedById: userId,
          idempotencyKey: `incomplete-review-${suffix}`,
          inputSnapshot: { attempt: 3 },
          useful: true,
        },
      }),
    ).rejects.toThrow();
  });
});
