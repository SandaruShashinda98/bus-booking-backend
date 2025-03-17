import { API_ENDPOINTS } from '@constant/pbx/api-endpoints';
import { PbxAuthService } from '@module/pbx/services/pbx-auth.service';
import { PbxService } from '@module/pbx/services/pbx.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkspaceService {
  constructor(private readonly pbxService: PbxService) {}

  getUsers() {
    const users = this.pbxService.makeAPICall('GET', API_ENDPOINTS.USERS, null);
    return users;
  }

  getRecentCalls() {
    return [
      {
        _id: 'CALL001',
        index: 'CALL001',
        lead_id: 'LEAD456',
        call_type: 'PREDICTIVE_CALL',
        start_at: '2025-02-14 09:30:00',
        lead_name: 'John Smith',
        campaign_name: 'Q1 Sales Drive',
        group_name: 'Sales Team A',
        lead_status: 'New Lead',
        call_duration: '00:05:23',
        call_bill_duration: '00:05:30',
        disposition: 'Interested',
        dst: '+1234567890',
        lead_caller_id_number: '+1987654321',
        status: 'FAILED',
      },
      {
        _id: 'CALL002',
        index: 'CALL002',
        lead_id: 'LEAD789',
        call_type: 'PREDICTIVE_CALL',
        start_at: '2025-02-14 10:15:00',
        lead_name: 'Sarah Johnson',
        campaign_name: 'Product Launch',
        group_name: 'Support Team B',
        lead_status: 'Following Up',
        call_duration: '00:08:45',
        call_bill_duration: '00:09:00',
        disposition: 'Meeting Scheduled',
        dst: '+1234567891',
        lead_caller_id_number: '+1987654322',
        status: 'FAILED',
      },
      {
        _id: 'CALL003',
        index: 'CALL003',
        lead_id: 'LEAD101',
        call_type: 'SCHEDULE_CALL',
        start_at: '2025-02-14 11:00:00',
        lead_name: 'Michael Brown',
        campaign_name: 'Follow-up Campaign',
        group_name: 'Sales Team B',
        lead_status: 'Qualified',
        call_duration: '00:03:15',
        call_bill_duration: '00:03:30',
        disposition: 'Not Interested',
        dst: '+1234567892',
        lead_caller_id_number: '+1987654323',
        status: 'FAILED',
      },
      {
        _id: 'CALL004',
        index: 'CALL004',
        lead_id: 'LEAD202',
        call_type: 'SCHEDULE_CALL',
        start_at: '2025-02-14 11:45:00',
        lead_name: 'Emily Davis',
        campaign_name: 'Customer Feedback',
        group_name: 'Support Team A',
        lead_status: 'Active Customer',
        call_duration: '00:12:30',
        call_bill_duration: '00:13:00',
        disposition: 'Feedback Received',
        dst: '+1234567893',
        lead_caller_id_number: '+1987654324',
        status: 'OK',
      },
      {
        _id: 'CALL005',
        index: 'CALL005',
        lead_id: 'LEAD303',
        call_type: 'SCHEDULE_CALL',
        start_at: '2025-02-14 13:20:00',
        lead_name: 'Robert Wilson',
        campaign_name: 'Q1 Sales Drive',
        group_name: 'Sales Team C',
        lead_status: 'PENDING',
        call_duration: '00:04:45',
        call_bill_duration: '00:05:00',
        disposition: 'Call Back Later',
        dst: '+1234567894',
        lead_caller_id_number: '+1987654325',
        status: 'OK',
      },
    ];
  }

  getScheduledCalls() {
    return [
      {
        _id: 'CMPLD001',
        index: 'CMPLD001',
        lead_id: 'LD78901',
        email: 'jennifer.parker@email.com',
        purchase_date: '2025-01-15',
        first_name: 'Jennifer',
        last_name: 'Parker',
        lead_name: 'Jennifer Parker',
        campaign_name: 'Spring Product Launch',
        phone: '+1-555-0123',
        assigned_to: 'Mark Wilson',
        call_after: '2025-02-15 10:30:00',
        updated_by: 'Sarah Johnson',
        last_comment: 'Client requested morning call back',
        indicators: 'High Priority',
        start_at: '2025-02-15 10:30:00',
        updated_at: '2025-02-14 15:30:00',
        status: 'BAD_LINE',
      },
      {
        _id: 'CMPLD002',
        index: 'CMPLD002',
        lead_id: 'LD78902',
        email: 'robert.chen@email.com',
        purchase_date: '2025-01-20',
        first_name: 'Robert',
        last_name: 'Chen',
        lead_name: 'Robert Chen',
        campaign_name: 'Enterprise Solutions',
        phone: '+1-555-0124',
        assigned_to: 'Jessica Lee',
        call_after: '2025-02-15 14:00:00',
        updated_by: 'Michael Brown',
        last_comment: 'Interested in premium package',
        indicators: 'Warm Lead',
        start_at: '2025-02-15 14:00:00',
        updated_at: '2025-02-14 16:45:00',
        status: 'BL_MANUAL_PREFIX',
      },
      {
        _id: 'CMPLD003',
        index: 'CMPLD003',
        lead_id: 'LD78903',
        email: 'maria.garcia@email.com',
        purchase_date: '2025-01-25',
        first_name: 'Maria',
        last_name: 'Garcia',
        lead_name: 'Maria Garcia',
        campaign_name: 'Customer Retention',
        phone: '+1-555-0125',
        assigned_to: 'David Thompson',
        call_after: '2025-02-16 09:15:00',
        updated_by: 'Emma Wilson',
        last_comment: 'Follow-up on service inquiry',
        indicators: 'Regular',
        start_at: '2025-02-16 09:15:00',
        updated_at: '2025-02-14 17:20:00',
        status: 'BUSY',
      },
      {
        _id: 'CMPLD004',
        index: 'CMPLD004',
        lead_id: 'LD78904',
        email: 'james.smith@email.com',
        purchase_date: '2025-02-01',
        first_name: 'James',
        last_name: 'Smith',
        lead_name: 'James Smith',
        campaign_name: 'New Feature Introduction',
        phone: '+1-555-0126',
        assigned_to: 'Linda Martinez',
        call_after: '2025-02-16 11:30:00',
        updated_by: 'Chris Anderson',
        last_comment: 'Requested demo of new features',
        indicators: 'VIP Client',
        start_at: '2025-02-16 11:30:00',
        updated_at: '2025-02-14 18:10:00',
        status: 'INTERESTED_BUT_EXPENSIVE',
      },
      {
        _id: 'CMPLD005',
        index: 'CMPLD005',
        lead_id: 'LD78905',
        email: 'sophia.patel@email.com',
        purchase_date: '2025-02-05',
        first_name: 'Sophia',
        last_name: 'Patel',
        lead_name: 'Sophia Patel',
        campaign_name: 'Q1 Check-in',
        phone: '+1-555-0127',
        assigned_to: 'Ryan Cooper',
        call_after: '2025-02-16 15:45:00',
        updated_by: 'Alex Turner',
        last_comment: 'Scheduling quarterly review',
        indicators: 'Priority',
        start_at: '2025-02-16 15:45:00',
        updated_at: '2025-02-14 19:00:00',
        status: 'NOT_INTERESTED',
      },
    ];
  }
}
