import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Settings,
  Download,
  Database,
  Smartphone,
  Calculator,
  Users,
  Lock,
  MessageSquare,
  HelpCircle,
  Heart,
  Trash2,
  FileText,
  PieChart,
  TrendingUp,
  Shield,
  Palette,
  Bell,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneStorage } from "../utils/phoneStorage";

export function More() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    transactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    // Get statistics
    const transactions = phoneStorage.loadTransactions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      transactions: transactions.length,
      totalIncome,
      totalExpenses,
      thisMonth: thisMonthTransactions.length,
    });
  }, []);

  const tools = [
    {
      id: 'preferences',
      title: 'Configuration',
      subtitle: 'App settings & themes',
      icon: Settings,
      color: 'bg-blue-500/10 text-blue-500',
      action: () => navigate('/preferences')
    },
    {
      id: 'accounts',
      title: 'Accounts',
      subtitle: 'Manage accounts',
      icon: Users,
      color: 'bg-green-500/10 text-green-500',
      action: () => {}
    },
    {
      id: 'passcode',
      title: 'Passcode',
      subtitle: 'Security settings',
      icon: Lock,
      color: 'bg-orange-500/10 text-orange-500',
      action: () => {}
    },
    {
      id: 'export',
      title: 'Export',
      subtitle: 'Download records',
      icon: Download,
      color: 'bg-indigo-500/10 text-indigo-500',
      action: () => navigate('/export-records')
    },
    {
      id: 'backup',
      title: 'Backup',
      subtitle: 'Data backup',
      icon: Database,
      color: 'bg-emerald-500/10 text-emerald-500',
      action: () => navigate('/backup-restore')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Advanced reports',
      icon: PieChart,
      color: 'bg-purple-500/10 text-purple-500',
      action: () => navigate('/analysis')
    },
    {
      id: 'feedback',
      title: 'Feedback',
      subtitle: 'Send feedback',
      icon: MessageSquare,
      color: 'bg-pink-500/10 text-pink-500',
      action: () => {}
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Support center',
      icon: HelpCircle,
      color: 'bg-amber-500/10 text-amber-500',
      action: () => {}
    },
    {
      id: 'recommend',
      title: 'Recommend',
      subtitle: 'Share with friends',
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-500',
      action: () => {}
    }
  ];

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            More Options
          </h1>
          <p className="text-muted-foreground mt-1">Tools, settings, and quick actions</p>
        </div>


        {/* Tools Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 px-1">Tools & Settings</h2>
          <div className="grid grid-cols-3 gap-4">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-0 bg-card/50 backdrop-blur-sm"
                  onClick={tool.action}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center transition-transform hover:scale-110`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tool.subtitle}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 px-1">Quick Actions</h2>
          <div className="space-y-2">
            <Card className="p-4">
              <button
                onClick={() => navigate('/preferences')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Storage & Preferences</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.transactions} records stored locally
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/20">
                  Active
                </Badge>
              </button>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-medium">Net Balance</div>
                    <div className="text-sm text-muted-foreground">
                      Current financial position
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${stats.totalIncome - stats.totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{(stats.totalIncome - stats.totalExpenses).toLocaleString()}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">Clear Finance v5.8 - Free</p>
        </div>
      </div>
    </Layout>
  );
}
