import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Smartphone
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const revenueData = [
  { date: '12 Dec', revenus: 45000 },
  { date: '13 Dec', revenus: 52000 },
  { date: '14 Dec', revenus: 48000 },
  { date: '15 Dec', revenus: 68000 },
  { date: '16 Dec', revenus: 75000 },
  { date: '17 Dec', revenus: 89000 },
  { date: '18 Dec', revenus: 105000 },
];

const transactions = [
  {
    id: 'TXN001',
    user: 'Jean Kouassi',
    type: 'Boost Premium',
    amount: 2500,
    method: 'Orange Money',
    status: 'completed',
    date: '18 Dec 2024 14:30',
    reference: 'OM-2024-001234'
  },
  {
    id: 'TXN002',
    user: 'Aya Diarra',
    type: 'Recharge',
    amount: 10000,
    method: 'MTN Mobile Money',
    status: 'completed',
    date: '18 Dec 2024 13:15',
    reference: 'MTN-2024-005678'
  },
  {
    id: 'TXN003',
    user: 'Koffi Yao',
    type: 'Boost Pro',
    amount: 1200,
    method: 'Wave',
    status: 'pending',
    date: '18 Dec 2024 12:45',
    reference: 'WAVE-2024-009012'
  },
  {
    id: 'TXN004',
    user: 'Aminata Traoré',
    type: 'Boost Basique',
    amount: 500,
    method: 'Moov Money',
    status: 'completed',
    date: '18 Dec 2024 11:20',
    reference: 'MOOV-2024-003456'
  },
  {
    id: 'TXN005',
    user: 'Seydou Koné',
    type: 'Recharge',
    amount: 5000,
    method: 'Orange Money',
    status: 'failed',
    date: '18 Dec 2024 10:00',
    reference: 'OM-2024-001235'
  },
  {
    id: 'TXN006',
    user: 'Fatou Camara',
    type: 'Boost Premium',
    amount: 2500,
    method: 'MTN Mobile Money',
    status: 'completed',
    date: '17 Dec 2024 16:30',
    reference: 'MTN-2024-005679'
  },
];

export function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       t.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              Gestion des paiements
            </h1>
            <p className="text-gray-600">
              Suivez toutes les transactions et revenus
            </p>
          </div>
          <Button className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold">
            <Download className="w-5 h-5 mr-2" />
            Exporter rapport
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus du jour</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {transactions.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de succès</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="p-6 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Revenus des 7 derniers jours
              </h3>
              <p className="text-sm text-gray-600">
                Évolution quotidienne
              </p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
              +42%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenus"
                stroke="#FACC15"
                strokeWidth={3}
                dot={{ fill: '#FACC15', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Filters */}
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par utilisateur ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-[#0F172A] text-white' : ''}
              >
                Tout
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                className={filterStatus === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Réussi
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                className={filterStatus === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
              >
                <Clock className="w-4 h-4 mr-1" />
                En attente
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('failed')}
                className={filterStatus === 'failed' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Échoué
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                    ID Transaction
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                    Utilisateur
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                    Méthode
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">
                    Montant
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-mono text-sm font-semibold text-[#0F172A]">
                          {transaction.id}
                        </p>
                        <p className="font-mono text-xs text-gray-500">
                          {transaction.reference}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-[#0F172A]">
                        {transaction.user}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {transaction.method}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-[#0F172A] text-lg">
                        {transaction.amount.toLocaleString()} CFA
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {transaction.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Complété
                        </span>
                      )}
                      {transaction.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                      {transaction.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                          <XCircle className="w-3 h-3" />
                          Échoué
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {transaction.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune transaction trouvée</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
