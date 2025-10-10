import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

type Props = {
  name: string;
  slogan?: string | null;
  program?: string | null;
  rightSlot?: React.ReactNode;
};

export default function CandidateCard({
  name,
  slogan,
  program,
  rightSlot,
}: Props) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              {name}
            </CardTitle>
            {slogan && (
              <Badge variant="secondary" className="text-xs">
                {slogan}
              </Badge>
            )}
          </div>
          {rightSlot}
        </div>
      </CardHeader>

      {program && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Programme
            </h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {program}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
