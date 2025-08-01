import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export function Analysis() {
  const currentMonth = "August, 2025";
  
  // Calendar data for August 2025
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 5; // August 1st, 2025 is a Friday (0=Sunday, 1=Monday, etc.)

  return (
    <Layout>
      <div className="space-y-6 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{currentMonth}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Financial Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">EXPENSE</div>
              <div className="text-lg font-bold text-red-400">₹10,000.00</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">INCOME</div>
              <div className="text-lg font-bold text-green-400">₹267,200.00</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TOTAL</div>
              <div className="text-lg font-bold text-green-400">₹257,200.00</div>
            </div>
          </div>
        </Card>

        {/* Expense Flow Chart */}
        <Card className="p-4">
          <Button variant="outline" className="w-full mb-4">
            EXPENSE FLOW
          </Button>
          
          {/* Simple chart representation */}
          <div className="h-48 bg-muted rounded-lg flex items-end justify-center p-4">
            <div className="flex items-end h-full w-full">
              <div className="w-2 bg-red-400 rounded-t" style={{ height: '80%' }}></div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Aug 01</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Aug 09</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Aug 16</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Aug 24</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Aug 31</div>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-center">
            <div className="text-sm text-muted-foreground">-₹11,000.00</div>
            <div className="text-sm text-muted-foreground">-₹7,333.00</div>
            <div className="text-sm text-muted-foreground">-₹3,666.00</div>
            <div className="text-sm text-muted-foreground">-₹0.00</div>
          </div>
        </Card>

        {/* Calendar */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentMonth}</h3>
          <Card className="p-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDay }, (_, i) => (
                <div key={`empty-${i}`} className="h-10"></div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day) => (
                <div key={day} className="h-10 flex items-center justify-center relative">
                  <span className={`text-sm ${day === 1 ? 'font-bold' : ''}`}>
                    {day}
                  </span>
                  {day === 1 && (
                    <div className="absolute bottom-0 text-xs text-red-400">
                      -10.0k
                    </div>
                  )}
                  {day !== 1 && (
                    <div className="absolute bottom-0 text-xs text-muted-foreground">
                      •
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transaction Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Aug 01, Friday</h3>
          <div className="space-y-3">
            <TransactionItem 
              icon="💼"
              category="Salary"
              account="Savings"
              amount="₹267,200.00"
              type="income"
            />
            <TransactionItem 
              icon="✅"
              category="Insurance"
              account="Savings"
              amount="-₹10,000.00"
              type="expense"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface TransactionItemProps {
  icon: string;
  category: string;
  account: string;
  amount: string;
  type: "income" | "expense";
}

function TransactionItem({ icon, category, account, amount, type }: TransactionItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {icon}
          </div>
          <div>
            <div className="font-medium">{category}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              {account}
            </div>
          </div>
        </div>
        <div className={`font-semibold ${type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
          {amount}
        </div>
      </div>
    </Card>
  );
}
