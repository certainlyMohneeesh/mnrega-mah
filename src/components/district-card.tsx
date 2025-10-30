import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Users, Briefcase } from "lucide-react";
import { formatIndianNumber, formatNumber } from "@/lib/utils";

interface District {
  id: string;
  code: string;
  name: string;
  stateCode: string;
  stateName: string;
  latestMetric?: {
    totalExpenditure: number;
    totalHouseholdsWorked: number;
    numberOfCompletedWorks: number;
    finYear: string;
    month: string;
  } | null;
  _count?: {
    metrics: number;
  };
}

interface DistrictCardProps {
  district: District;
}

export function DistrictCard({ district }: DistrictCardProps) {
  const hasMetrics = district.latestMetric;

  return (
    <Link href={`/district/${district.id}`}>
      <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                {district.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                District Code: {district.code}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        
        {hasMetrics ? (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">Expenditure</span>
                </div>
                <p className="text-sm font-bold">
                  {formatIndianNumber(district.latestMetric!.totalExpenditure)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-muted-foreground">Households</span>
                </div>
                <p className="text-sm font-bold">
                  {formatNumber(district.latestMetric!.totalHouseholdsWorked)}
                </p>
              </div>
              
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-muted-foreground">Works Completed</span>
                </div>
                <p className="text-sm font-bold">
                  {formatNumber(district.latestMetric!.numberOfCompletedWorks)}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Latest: {district.latestMetric!.month} {district.latestMetric!.finYear}
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-sm text-muted-foreground">No data available</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
