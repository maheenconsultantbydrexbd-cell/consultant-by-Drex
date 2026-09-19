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

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_PASSPORT_RECEIPTS: PassportReceipt[] = [];


