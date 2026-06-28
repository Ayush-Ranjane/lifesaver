import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Tailwind,
  Preview,
} from '@react-email/components';
import * as React from 'react';
import type { Task, Goal } from '@/types';

interface SummaryEmailProps {
  userName: string;
  tasks: Task[];
  goals: Goal[];
}

export const SummaryEmail = ({ userName, tasks, goals }: SummaryEmailProps) => {
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter((t) => new Date(t.deadline) < new Date());
  
  const topGoals = goals.filter((g) => g.status !== 'completed').slice(0, 3);

  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#4F46E5',
                void: '#050508',
                surface: '#121217',
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Your LifeSaver Daily Briefing 🚀</Preview>
        <Body className="bg-void text-white font-sans m-0 p-4">
          <Container className="bg-surface border border-gray-800 rounded-xl p-8 my-8 mx-auto max-w-[600px] shadow-2xl">
            <Section className="text-center mb-8">
              <Heading className="text-3xl font-bold text-white m-0 tracking-tight">
                Life<span className="text-[#00D9FF]">Saver</span>
              </Heading>
              <Text className="text-gray-400 text-sm mt-2">
                Your Daily Briefing
              </Text>
            </Section>

            <Hr className="border-gray-800 my-6" />

            <Section>
              <Heading as="h2" className="text-xl font-semibold text-white mb-4">
                Good morning, {userName}! 👋
              </Heading>
              <Text className="text-gray-300 text-base leading-relaxed">
                Here is a summary of your goals and tasks for today. You have <strong>{pendingTasks.length}</strong> active tasks, and <strong>{overdueTasks.length}</strong> that need immediate attention.
              </Text>
            </Section>

            {/* Goals Section */}
            {topGoals.length > 0 && (
              <Section className="mt-8 bg-[#1A1A24] p-6 rounded-lg border border-gray-800">
                <Heading as="h3" className="text-lg font-medium text-white m-0 mb-4 flex items-center">
                  🎯 Top Goals
                </Heading>
                {topGoals.map((goal) => (
                  <div key={goal.goalId} className="mb-4 last:mb-0">
                    <Text className="text-white font-medium m-0">{goal.title}</Text>
                    <Text className="text-gray-400 text-sm m-0 mt-1">
                      Progress: {Math.round(goal.progress)}% • Due: {new Date(goal.deadline).toLocaleDateString()}
                    </Text>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className="bg-brand h-1.5 rounded-full" 
                        style={{ width: `${goal.progress}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Tasks Section */}
            {pendingTasks.length > 0 && (
              <Section className="mt-8">
                <Heading as="h3" className="text-lg font-medium text-white m-0 mb-4">
                  ⚡ Action Items
                </Heading>
                {pendingTasks.slice(0, 5).map((task) => {
                  const isOverdue = new Date(task.deadline) < new Date();
                  return (
                    <div key={task.taskId} className="mb-3 flex items-start gap-3 p-3 rounded-lg border border-gray-800 bg-[#09090B]">
                      <div className="mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-[#00D9FF]'}`} />
                      </div>
                      <div>
                        <Text className="text-white font-medium m-0 text-sm">{task.title}</Text>
                        <Text className={`text-xs m-0 mt-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                          Due: {new Date(task.deadline).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  );
                })}
                {pendingTasks.length > 5 && (
                  <Text className="text-gray-500 text-xs italic mt-2 text-center">
                    + {pendingTasks.length - 5} more tasks waiting in your inbox.
                  </Text>
                )}
              </Section>
            )}

            <Hr className="border-gray-800 my-8" />

            <Section className="text-center">
              <Button
                href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
                className="bg-brand text-white px-6 py-3 rounded-lg font-semibold text-sm inline-block"
              >
                Open LifeSaver Dashboard
              </Button>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-gray-600 text-xs">
                You're receiving this email because you opted into Daily Briefings.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SummaryEmail;
