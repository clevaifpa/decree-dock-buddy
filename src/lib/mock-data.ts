export type ContractStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'signed' | 'active' | 'expired' | 'liquidated';
export type ObligationType = 'payment' | 'delivery' | 'reporting' | 'renewal' | 'compliance' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Department = 'sales' | 'marketing' | 'engineering' | 'finance' | 'hr' | 'operations';

export interface Contract {
  id: string;
  title: string;
  partner: string;
  department: Department;
  requester: string;
  status: ContractStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  value?: number;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface Obligation {
  id: string;
  contractId: string;
  contractTitle: string;
  type: ObligationType;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  amount?: number;
}

export const departments: Record<Department, string> = {
  sales: 'Kinh doanh',
  marketing: 'Marketing',
  engineering: 'Kỹ thuật',
  finance: 'Tài chính',
  hr: 'Nhân sự',
  operations: 'Vận hành',
};

export const statusLabels: Record<ContractStatus, string> = {
  draft: 'Nháp',
  pending_review: 'Chờ review',
  in_review: 'Đang review',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  signed: 'Đã ký',
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  liquidated: 'Đã thanh lý',
};

export const obligationTypeLabels: Record<ObligationType, string> = {
  payment: 'Thanh toán',
  delivery: 'Giao hàng',
  reporting: 'Báo cáo',
  renewal: 'Gia hạn',
  compliance: 'Tuân thủ',
  other: 'Khác',
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

export const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Hợp đồng cung cấp dịch vụ cloud',
    partner: 'FPT Telecom',
    department: 'engineering',
    requester: 'Nguyễn Văn An',
    status: 'pending_review',
    priority: 'high',
    createdAt: '2026-02-08',
    updatedAt: '2026-02-09',
    value: 500000000,
    description: 'Hợp đồng cung cấp dịch vụ cloud hosting cho hệ thống nội bộ.',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
  },
  {
    id: '2',
    title: 'Hợp đồng thuê văn phòng',
    partner: 'Công ty BĐS Vinhomes',
    department: 'operations',
    requester: 'Trần Thị Bình',
    status: 'in_review',
    priority: 'urgent',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-10',
    value: 1200000000,
    description: 'Hợp đồng thuê văn phòng tại tòa nhà Landmark 81.',
    startDate: '2026-04-01',
    endDate: '2028-03-31',
  },
  {
    id: '3',
    title: 'Hợp đồng quảng cáo digital',
    partner: 'Google Vietnam',
    department: 'marketing',
    requester: 'Lê Minh Châu',
    status: 'approved',
    priority: 'medium',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-01',
    value: 200000000,
    description: 'Hợp đồng quảng cáo Google Ads cho Q1 2026.',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
  },
  {
    id: '4',
    title: 'Hợp đồng tuyển dụng headhunter',
    partner: 'Navigos Group',
    department: 'hr',
    requester: 'Phạm Đức Dũng',
    status: 'active',
    priority: 'low',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-15',
    value: 150000000,
    description: 'Hợp đồng dịch vụ tuyển dụng nhân sự cấp cao.',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
  },
  {
    id: '5',
    title: 'Hợp đồng bảo trì hệ thống CNTT',
    partner: 'CMC Corporation',
    department: 'engineering',
    requester: 'Hoàng Văn Em',
    status: 'signed',
    priority: 'high',
    createdAt: '2026-01-25',
    updatedAt: '2026-02-03',
    value: 350000000,
    description: 'Hợp đồng bảo trì và hỗ trợ kỹ thuật hệ thống server.',
    startDate: '2026-02-15',
    endDate: '2027-02-14',
  },
  {
    id: '6',
    title: 'Hợp đồng mua sắm thiết bị',
    partner: 'Synnex FPT',
    department: 'finance',
    requester: 'Võ Thị Giang',
    status: 'draft',
    priority: 'medium',
    createdAt: '2026-02-09',
    updatedAt: '2026-02-09',
    value: 800000000,
    description: 'Mua sắm 50 máy tính xách tay cho nhân viên mới.',
  },
];

export const mockObligations: Obligation[] = [
  {
    id: '1',
    contractId: '4',
    contractTitle: 'Hợp đồng tuyển dụng headhunter',
    type: 'payment',
    description: 'Thanh toán phí dịch vụ đợt 1',
    dueDate: '2026-02-15',
    status: 'overdue',
    amount: 50000000,
  },
  {
    id: '2',
    contractId: '2',
    contractTitle: 'Hợp đồng thuê văn phòng',
    type: 'payment',
    description: 'Đặt cọc thuê văn phòng (3 tháng)',
    dueDate: '2026-02-20',
    status: 'pending',
    amount: 300000000,
  },
  {
    id: '3',
    contractId: '3',
    contractTitle: 'Hợp đồng quảng cáo digital',
    type: 'reporting',
    description: 'Báo cáo hiệu quả quảng cáo tháng 2',
    dueDate: '2026-03-05',
    status: 'pending',
  },
  {
    id: '4',
    contractId: '5',
    contractTitle: 'Hợp đồng bảo trì hệ thống CNTT',
    type: 'delivery',
    description: 'Bàn giao tài liệu hệ thống cho đối tác bảo trì',
    dueDate: '2026-02-14',
    status: 'overdue',
  },
  {
    id: '5',
    contractId: '1',
    contractTitle: 'Hợp đồng cung cấp dịch vụ cloud',
    type: 'compliance',
    description: 'Ký phụ lục bảo mật dữ liệu (NDA)',
    dueDate: '2026-02-25',
    status: 'pending',
  },
  {
    id: '6',
    contractId: '4',
    contractTitle: 'Hợp đồng tuyển dụng headhunter',
    type: 'renewal',
    description: 'Đánh giá gia hạn hợp đồng',
    dueDate: '2026-06-15',
    status: 'pending',
  },
];
