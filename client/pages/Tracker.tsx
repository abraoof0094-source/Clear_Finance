import { Layout } from "../components/Layout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export function Tracker() {
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
              <div className="text-sm text-muted-foreground">TRACKED</div>
              <div className="text-lg font-bold text-blue-400">₹85,500.00</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">PLANNED</div>
              <div className="text-lg font-bold text-yellow-400">
                ₹120,000.00
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">REMAINING</div>
              <div className="text-lg font-bold text-green-400">
                ₹34,500.00
              </div>
            </div>
          </div>
        </Card>

        {/* Tracking Progress Chart */}
        <Card className="p-4">
          <Button variant="outline" className="w-full mb-4">
            TRACKING PROGRESS
          </Button>

          {/* Progress chart representation */}
          <div className="h-48 bg-muted rounded-lg flex items-end justify-center p-4">
            <div className="flex items-end h-full w-full">
              <div
                className="w-3 bg-blue-400 rounded-t mr-1"
                style={{ height: "75%" }}
              ></div>
              <div
                className="w-3 bg-yellow-400 rounded-t mr-1"
                style={{ height: "90%" }}
              ></div>
              <div
                className="w-3 bg-green-400 rounded-t mr-1"
                style={{ height: "60%" }}
              ></div>
              <div
                className="w-3 bg-blue-400 rounded-t mr-1"
                style={{ height: "85%" }}
              ></div>
              <div
                className="w-3 bg-yellow-400 rounded-t"
                style={{ height: "70%" }}
              ></div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Week 1</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Week 2</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Week 3</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">Week 4</div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <div className="text-sm text-muted-foreground">₹22,500.00</div>
            <div className="text-sm text-muted-foreground">₹18,200.00</div>
            <div className="text-sm text-muted-foreground">₹25,800.00</div>
            <div className="text-sm text-muted-foreground">₹19,000.00</div>
          </div>
        </Card>

        {/* Calendar */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentMonth}</h3>
          <Card className="p-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
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
                <div
                  key={day}
                  className="h-10 flex items-center justify-center relative"
                >
                  <span className={`text-sm ${day === 1 || day === 15 || day === 25 ? "font-bold" : ""}`}>
                    {day}
                  </span>
                  {day === 1 && (
                    <div className="absolute bottom-0 text-xs text-blue-400">
                      +22.5k
                    </div>
                  )}
                  {day === 15 && (
                    <div className="absolute bottom-0 text-xs text-green-400">
                      +18.2k
                    </div>
                  )}
                  {day === 25 && (
                    <div className="absolute bottom-0 text-xs text-yellow-400">
                      +25.8k
                    </div>
                  )}
                  {![1, 15, 25].includes(day) && (
                    <div className="absolute bottom-0 text-xs text-muted-foreground">
                      •
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tracking Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Aug 01, Friday</h3>
          <div className="space-y-3">
            <TrackingItem
              icon="🎯"
              category="Fitness Goal"
              target="5 days workout"
              progress="3 days completed"
              completion={60}
              type="progress"
            />
            <TrackingItem
              icon="💰"
              category="Savings Goal"
              target="₹50,000.00"
              progress="₹32,500.00"
              completion={65}
              type="money"
            />
            <TrackingItem
              icon="📚"
              category="Learning Goal"
              target="2 hours study"
              progress="1.5 hours completed"
              completion={75}
              type="time"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface TrackingItemProps {
  icon: string;
  category: string;
  target: string;
  progress: string;
  completion: number;
  type: "progress" | "money" | "time";
}

function TrackingItem({
  icon,
  category,
  target,
  progress,
  completion,
  type,
}: TrackingItemProps) {
  const getCompletionColor = () => {
    if (completion >= 80) return "text-green-400";
    if (completion >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
            {icon}
          </div>
          <div>
            <div className="font-medium">{category}</div>
            <div className="text-sm text-muted-foreground">
              Target: {target}
            </div>
            <div className="text-sm text-muted-foreground">
              Progress: {progress}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-semibold ${getCompletionColor()}`}>
            {completion}%
          </div>
          <div className="w-16 h-2 bg-muted rounded-full mt-1">
            <div
              className={`h-2 rounded-full ${completion >= 80 ? "bg-green-400" : completion >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
