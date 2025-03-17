import { Injectable } from '@nestjs/common';
@Injectable()
export class RealtimeService {
  getRealtimeStats() {
    return [
      {
        key: 'ONLINE_USERS',
        icon: 'SignIn',
        text: 'Online users',
        value: '33/159',
      },
      {
        key: 'ACTIVE_AGENTS',
        icon: 'UsersThree',
        text: 'Active agents',
        value: '33',
      },
      {
        key: 'OFFLINE_USERS',
        icon: 'SignOut',
        text: 'Offline users',
        value: '3',
      },
      {
        key: 'AVERAGE_DROP_RATE',
        icon: 'ChartLineDown',
        text: 'Average drop rate',
        value: '21.43%',
      },
      {
        key: 'AVERAGE_IDEAL_TIME',
        icon: 'ClockCountdown',
        text: 'Average idle time',
        value: '12.34s',
      },
      {
        key: 'AVERAGE_FEEDBACK_TIME',
        icon: 'ChatText',
        text: 'Average feedback time',
        value: '25.83s',
      },
    ];
  }

  getUserGroupStats() {
    return [
      {
        _id: 1,
        name: 'A group',
        ratio: '9:00',
        users: [
          { label: 'Bridged', value: 4, color: 'bg-teal-500' },
          { label: 'Initialized', value: 4, color: 'bg-blue-500' },
          { label: 'In feedback', value: 20, color: 'bg-green-500' },
          { label: 'Answered', value: 3, color: 'bg-red-500' },
        ],
        leads: [
          { label: 'Available', value: 2123, color: 'bg-teal-500' },
          { label: 'Loaded', value: 3, color: 'bg-blue-500' },
          { label: 'Direct', value: 20, color: 'bg-green-500' },
        ],
        lead_states: [
          { label: 'Bridged', value: 4, color: 'bg-teal-500' },
          { label: 'Initialized', value: 4, color: 'bg-blue-500' },
          { label: 'Ringing', value: 20, color: 'bg-green-500' },
          { label: 'Answered', value: 3, color: 'bg-red-500' },
        ],
        drop_rates: '14.29%',
        average_idle_time: '12.8s (79.74s)',
        skill_groups: 'A+ Skill Group',
      },
      {
        _id: 2,
        name: 'B group',
        ratio: '7:30',
        users: [
          { label: 'Bridged', value: 6, color: 'bg-teal-500' },
          { label: 'Initialized', value: 5, color: 'bg-blue-500' },
          { label: 'In feedback', value: 15, color: 'bg-green-500' },
          { label: 'Answered', value: 5, color: 'bg-red-500' },
        ],
        leads: [
          { label: 'Available', value: 1856, color: 'bg-teal-500' },
          { label: 'Loaded', value: 5, color: 'bg-blue-500' },
          { label: 'Direct', value: 25, color: 'bg-green-500' },
        ],
        lead_states: [
          { label: 'Bridged', value: 6, color: 'bg-teal-500' },
          { label: 'Initialized', value: 5, color: 'bg-blue-500' },
          { label: 'Ringing', value: 15, color: 'bg-green-500' },
          { label: 'Answered', value: 5, color: 'bg-red-500' },
        ],
        drop_rates: '11.83%',
        average_idle_time: '15.2s (82.31s)',
        skill_groups: 'B+ Skill Group',
      },
    ];
  }

  getAgentsStats() {
    return [
      {
        _id: 1,
        name: 'Bowya Allway',
        state: 'WAITING_FOR_CALL',
        state_duration: '0h 0m 31s',
        groups: 'A Skill Group, A+ Group',
        call_details_or_reason:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
        lead_last_status: 'NO_ANSWER_SYSTEM',
        lead_time: new Date(),
        average_idle_time: '12.8(79.74s)',
      },
      {
        _id: 2,
        name: 'John Doe',
        state: 'IN_CALL_UNDER_1_MINT',
        state_duration: '0h 0m 31s',
        groups: 'A Skill Group, A+ Group',
        call_details_or_reason:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
        lead_last_status: 'NEW_LEAD',
        lead_time: new Date(),
        average_idle_time: '12.8(79.74s)',
      },
      {
        _id: 3,
        name: 'John Doe',
        state: 'IN_FEEDBACK',
        state_duration: '0h 0m 31s',
        groups: 'A Skill Group, A+ Group',
        call_details_or_reason:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
        lead_last_status: 'NEW_LEAD',
        lead_time: new Date(),
        average_idle_time: '12.8(79.74s)',
      },
      {
        _id: 4,
        name: 'John Doe',
        state: 'IN_CALL_BETWEEN_1_TO_5_MINT',
        state_duration: '0h 0m 31s',
        groups: 'A Skill Group, A+ Group',
        call_details_or_reason:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
        lead_last_status: 'NEW_LEAD',
        lead_time: new Date(),
        average_idle_time: '12.8(79.74s)',
      },
    ];
  }
}
