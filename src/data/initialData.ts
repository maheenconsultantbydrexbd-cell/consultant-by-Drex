import { CompanySettings, Customer, Invoice, PassportReceipt, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Sanjid Talukder',
    email: 'sanjidtalukder2020@gmail.com',
    role: 'admin',
    avatar: 'ST'
  },
  {
    id: 'usr-2',
    name: 'Tahmid Hossain',
    email: 'tahmid.consultant@drexbd.com',
    role: 'manager',
    avatar: 'TH'
  },
  {
    id: 'usr-3',
    name: 'Farhana Ahmed',
    email: 'farhana.billing@drexbd.com',
    role: 'staff',
    avatar: 'FA'
  },
  {
    id: 'usr-4',
    name: 'Nazmul Islam',
    email: 'nazmul.ops@drexbd.com',
    role: 'staff',
    avatar: 'NI'
  }
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'Consultant',
  sub_title: "By D'Rex",
  branch: 'Dhaka Branch',
  address: 'LEVEL 6, 44-F8, Panthapath, Dhaka 1250',
  phone: '01622-785981',
  whatsapp: '+8801622785981',
  email: 'consultantbydrexbd@gmail.com',
  website: 'www.consultantbydrex.com',
  currency: 'BDT',
  currency_symbol: '৳',
  invoice_prefix: 'INV-2026-',
  next_invoice_number: 1005,
  account_manager_name: 'Account Manager',
  account_manager_title: 'Authorized Signature',
  default_notes: '',
  default_terms: '',
  invoice_theme: 'classic_minimal'
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Mr. Rafiqul Islam',
    company_name: 'Apex Horizon Technologies Ltd.',
    address: 'Plot 14, Block C, Banani, Dhaka',
    phone: '+8801711223344',
    email: 'rafiqul@apexhorizon.com.bd',
    total_invoices: 3,
    total_spent: 175000,
    created_at: '2026-07-10',
    updated_at: '2026-08-15'
  },
  {
    id: 'cust-2',
    name: 'Tanvir Chowdhury',
    company_name: 'Greenfield Agri & Imports',
    address: 'House 52, Road 11, Dhanmondi, Dhaka',
    phone: '+8801819556677',
    email: 'tanvir@greenfield.com.bd',
    total_invoices: 2,
    total_spent: 85000,
    created_at: '2026-07-22',
    updated_at: '2026-08-12'
  },
  {
    id: 'cust-3',
    name: 'Nusrat Jahan',
    company_name: 'Starlight Media & Creative Agency',
    address: 'Suite 402, BDBL Bhaban, Kawran Bazar, Dhaka',
    phone: '+8801912334455',
    email: 'nusrat@starlightmedia.com',
    total_invoices: 1,
    total_spent: 45000,
    created_at: '2026-08-02',
    updated_at: '2026-08-02'
  },
  {
    id: 'cust-4',
    name: 'Engr. Mahbubur Rahman',
    company_name: 'Rahman Engineering & Construction',
    address: 'Sector 4, Road 7, Uttara, Dhaka',
    phone: '+8801678990011',
    email: 'mahbub@rahmaneng.com',
    total_invoices: 2,
    total_spent: 120000,
    created_at: '2026-08-05',
    updated_at: '2026-08-16'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoice_number: 'INV-2026-1001',
    customer_id: 'cust-1',
    customer: INITIAL_CUSTOMERS[0],
    invoice_date: '2026-08-10',
    due_date: '2026-08-25',
    items: [
      {
        id: 'item-1',
        item_name: 'Strategic Business Consultancy',
        description: 'Comprehensive business model & expansion strategy assessment for Q3-Q4',
        quantity: 1,
        unit_price: 50000,
        discount: 0,
        total: 50000
      },
      {
        id: 'item-2',
        item_name: 'Corporate Compliance & Legal Advisory',
        description: 'Statutory compliance verification and regulatory filing documentation',
        quantity: 1,
        unit_price: 35000,
        discount: 5000,
        total: 30000
      }
    ],
    subtotal: 85000,
    discount: 5000,
    total: 80000,
    in_words: 'Eighty Thousand Taka Only',
    payment_status: 'paid',
    notes: 'Payment received via City Bank Corporate Account.',
    terms: INITIAL_COMPANY_SETTINGS.default_terms,
    account_manager: 'Account Manager',
    created_by: 'Sanjid Talukder',
    created_at: '2026-08-10T10:30:00Z',
    updated_at: '2026-08-10T10:30:00Z'
  },
  {
    id: 'inv-1002',
    invoice_number: 'INV-2026-1002',
    customer_id: 'cust-2',
    customer: INITIAL_CUSTOMERS[1],
    invoice_date: '2026-08-12',
    due_date: '2026-08-26',
    items: [
      {
        id: 'item-3',
        item_name: 'Supply Chain Optimization & Assessment',
        description: 'Audit of warehouse logistics & distribution efficiency report',
        quantity: 1,
        unit_price: 45000,
        discount: 0,
        total: 45000
      }
    ],
    subtotal: 45000,
    discount: 0,
    total: 45000,
    in_words: 'Forty-Five Thousand Taka Only',
    payment_status: 'unpaid',
    notes: 'Awaiting client approval for final disbursement.',
    terms: INITIAL_COMPANY_SETTINGS.default_terms,
    account_manager: 'Account Manager',
    created_by: 'Tahmid Hossain',
    created_at: '2026-08-12T14:15:00Z',
    updated_at: '2026-08-12T14:15:00Z'
  },
  {
    id: 'inv-1003',
    invoice_number: 'INV-2026-1003',
    customer_id: 'cust-4',
    customer: INITIAL_CUSTOMERS[3],
    invoice_date: '2026-08-16',
    due_date: '2026-08-30',
    items: [
      {
        id: 'item-4',
        item_name: 'Project Feasibility & Risk Analysis',
        description: 'Phase 1 Structural Engineering Feasibility & Risk mitigation plan',
        quantity: 2,
        unit_price: 35000,
        discount: 5000,
        total: 65000
      },
      {
        id: 'item-5',
        item_name: 'Environmental Clearance Advisory',
        description: 'Documentation preparation for governmental regulatory compliance',
        quantity: 1,
        unit_price: 25000,
        discount: 0,
        total: 25000
      }
    ],
    subtotal: 95000,
    discount: 5000,
    total: 90000,
    in_words: 'Ninety Thousand Taka Only',
    payment_status: 'partial',
    notes: 'Advance 50% received (45,000 BDT). Remaining 45,000 BDT due upon milestone completion.',
    terms: INITIAL_COMPANY_SETTINGS.default_terms,
    account_manager: 'Account Manager',
    created_by: 'Sanjid Talukder',
    created_at: '2026-08-16T11:45:00Z',
    updated_at: '2026-08-16T11:45:00Z'
  },
  {
    id: 'inv-1004',
    invoice_number: 'INV-2026-1004',
    customer_id: 'cust-3',
    customer: INITIAL_CUSTOMERS[2],
    invoice_date: '2026-08-17',
    due_date: '2026-08-31',
    items: [
      {
        id: 'item-6',
        item_name: 'Brand Identity & Strategy Consultation',
        description: 'Brand positioning, target audience mapping, and corporate styling guidelines',
        quantity: 1,
        unit_price: 45000,
        discount: 0,
        total: 45000
      }
    ],
    subtotal: 45000,
    discount: 0,
    total: 45000,
    in_words: 'Forty-Five Thousand Taka Only',
    payment_status: 'paid',
    notes: 'Immediate payment via bKash Merchant account.',
    terms: INITIAL_COMPANY_SETTINGS.default_terms,
    account_manager: 'Account Manager',
    created_by: 'Farhana Ahmed',
    created_at: '2026-08-17T09:00:00Z',
    updated_at: '2026-08-17T09:00:00Z'
  }
];

export const INITIAL_PASSPORT_RECEIPTS: PassportReceipt[] = [
  {
    id: 'pr-1001',
    receipt_number: 'PR-2026-1001',
    date: '2026-09-08',
    client_name: 'Mr. Rafiqul Islam',
    passport_number: 'A08492817',
    mobile_number: '+8801711223344',
    email: 'rafiqul@apexhorizon.com.bd',
    customer_id: 'cust-1',
    service_purpose: 'India Visa Processing for Portugal Workpermit',
    passport_received_date: '2026-09-08',
    passport_status: 'With Office',
    received_by: 'Sanjid Talukder',
    notes: 'Received 1 original Bangladesh passport for India Double Entry Visa required for Portugal VFS Embassy appointment.',
    created_at: '2026-09-08T10:30:00Z',
    updated_at: '2026-09-08T10:30:00Z',
  },
  {
    id: 'pr-1002',
    receipt_number: 'PR-2026-1002',
    date: '2026-09-11',
    client_name: 'Tanvir Chowdhury',
    passport_number: 'B01938472',
    mobile_number: '+8801819556677',
    email: 'tanvir@greenfield.com.bd',
    customer_id: 'cust-2',
    service_purpose: 'India Visa Processing for Portugal Workpermit',
    passport_received_date: '2026-09-11',
    passport_status: 'Received',
    received_by: 'Tahmid Hossain',
    notes: 'Document verification completed. Client informed regarding 10-day processing window.',
    created_at: '2026-09-11T14:15:00Z',
    updated_at: '2026-09-11T14:15:00Z',
  },
  {
    id: 'pr-1003',
    receipt_number: 'PR-2026-1003',
    date: '2026-08-25',
    client_name: 'Engr. Mahmudul Hasan',
    passport_number: 'A05739201',
    mobile_number: '+8801912334455',
    email: 'mahmudul@gmail.com',
    service_purpose: 'Portugal Work Permit & Visa Documentation',
    passport_received_date: '2026-08-25',
    passport_status: 'Returned',
    received_by: 'Farhana Ahmed',
    returned_date: '2026-09-05',
    returned_by: 'Sanjid Talukder',
    notes: 'Visa successfully stamped and passport returned safely to client with client acknowledgement.',
    created_at: '2026-08-25T11:00:00Z',
    updated_at: '2026-09-05T16:00:00Z',
  },
];

