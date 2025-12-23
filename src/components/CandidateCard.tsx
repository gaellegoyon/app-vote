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
    <Card className="group border border-border/50 bg-gradient-to-br from-card via-card to-card/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              {name}
            </CardTitle>
            {slogan && (
              <Badge
                variant="secondary"
                className="inline-block text-xs font-medium px-3 py-1 bg-primary/5 dark:bg-primary/10 text-primary border border-primary/20"
              >
                &ldquo;{slogan}&rdquo;
              </Badge>
            )}
          </div>
          {rightSlot}
        </div>
      </CardHeader>

      {program && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
              Programme
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {program}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
