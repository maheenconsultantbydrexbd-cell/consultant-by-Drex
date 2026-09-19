import React, { useState } from 'react';
import { Customer, Invoice, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Building2,
  Edit,
  FilePlus,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';

interface CustomersPageProps {
  customers: Customer[];
  invoices: Invoice[];
  currencySymbol: string;
  currentUser: User;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onCreateInvoiceForCustomer: (customer: Customer) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  invoices,
  currencySymbol,
  currentUser,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onCreateInvoiceForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompanyName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setCompanyName(c.company_name || '');
    setAddress(c.address);
    setPhone(c.phone);
    setEmail(c.email);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: name.trim(),
        company_name: companyName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        updated_at: new Date().toISOString(),
      });
    } else {
      onAddCustomer({
        name: name.trim(),
        company_name: companyName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        total_invoices: 0,
        total_spent: 0,
      });
    }
    setIsModalOpen(false);
  };

  // Compute live client invoice counts
  const clientStats = customers.map((c) => {
    const clientInvoices = invoices.filter((inv) => inv.customer_id === c.id || inv.customer?.name === c.name);
    const totalSpent = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    return {
      ...c,
      total_invoices: clientInvoices.length,
      total_spent: totalSpent,
    };
  });

  const filteredCustomers = clientStats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage company clients, contact directories, and billing histories
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, company, phone, or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredCustomers.length}</span> clients
        </div>
      </div>

      {/* Customer Cards Grid or Empty State */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F3B2C] font-bold text-sm flex items-center justify-center border border-emerald-100 flex-shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                      {c.company_name && (
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{c.company_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {currentUser.role !== 'staff' && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomer(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete client (Admin & Manager only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Stats & Quick Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced</span>
                  <span className="text-xs font-extrabold text-[#0F3B2C]">
                    {formatCurrency(c.total_spent || 0, currencySymbol)}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">({c.total_invoices} invoices)</span>
                </div>

                <button
                  type="button"
                  onClick={() => onCreateInvoiceForCustomer(c)}
                  className="px-3 py-1.5 bg-[#7EA64B] hover:bg-[#8ebb54] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#0F3B2C] flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-[#7EA64B]" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">No Customers Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No client profiles match your current search query.'
              : 'Start by adding your first customer or client profile.'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0F3B2C] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#154d3a] transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add First Customer</span>
          </button>
        </div>
      )}


      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-display">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Customer / Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter client or customer name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company or organization"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>


              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01711-223344"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@domain.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Address / Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Banani, Dhaka"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F3B2C] hover:bg-[#154d3a] rounded-xl shadow-sm"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
