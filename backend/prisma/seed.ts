import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL is required to seed');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  const alice = await prisma.user.upsert({
    where: { emailNormalized: 'alice@example.com' },
    update: { displayName: 'Alice Example' },
    create: {
      emailNormalized: 'alice@example.com',
      displayName: 'Alice Example',
    },
  });
  const bob = await prisma.user.upsert({
    where: { emailNormalized: 'bob@example.com' },
    update: { displayName: 'Bob Example' },
    create: { emailNormalized: 'bob@example.com', displayName: 'Bob Example' },
  });
  const platform = await prisma.workspace.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { name: 'Platform Team', createdById: alice.id },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Platform Team',
      createdById: alice.id,
    },
  });
  const product = await prisma.workspace.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: { name: 'Product Team', createdById: bob.id },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Product Team',
      createdById: bob.id,
    },
  });
  await prisma.membership.upsert({
    where: {
      userId_workspaceId: { userId: alice.id, workspaceId: platform.id },
    },
    update: { role: 'admin', removedAt: null },
    create: { userId: alice.id, workspaceId: platform.id, role: 'admin' },
  });
  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: bob.id, workspaceId: platform.id } },
    update: { role: 'member', removedAt: null },
    create: { userId: bob.id, workspaceId: platform.id, role: 'member' },
  });
  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: bob.id, workspaceId: product.id } },
    update: { role: 'admin', removedAt: null },
    create: { userId: bob.id, workspaceId: product.id, role: 'admin' },
  });
  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {
      name: 'Seed project',
      workspaceId: platform.id,
      createdById: alice.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      name: 'Seed project',
      workspaceId: platform.id,
      createdById: alice.id,
    },
  });
  const task = await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {
      title: 'Seed task',
      projectId: project.id,
      createdById: alice.id,
      description: 'Seed task description',
      acceptanceCriteria: 'Seed task is persisted',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      title: 'Seed task',
      projectId: project.id,
      createdById: alice.id,
      description: 'Seed task description',
      acceptanceCriteria: 'Seed task is persisted',
    },
  });
  await prisma.execution.upsert({
    where: {
      taskId_idempotencyKey: {
        taskId: task.id,
        idempotencyKey: 'seed-execution-1',
      },
    },
    update: {
      requestedById: alice.id,
      inputSnapshot: { task: task.title },
      status: 'succeeded',
      output: { plan: 'Review seed data' },
      finishedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    create: {
      taskId: task.id,
      requestedById: alice.id,
      idempotencyKey: 'seed-execution-1',
      inputSnapshot: { task: task.title },
      status: 'succeeded',
      output: { plan: 'Review seed data' },
      finishedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  });
}

main().finally(() => prisma.$disconnect());
