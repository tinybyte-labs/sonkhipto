"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { trpc } from "@/utils/trpc";

export default function AdminDashboardPage() {
  const scrapeAllPublishersMut =
    trpc.admin.tasks.scrapeAllPublisher.useMutation({
      onSuccess: () => {
        toast({ title: "Success" });
      },
      onError(error) {
        toast({
          title: "Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  return (
    <div>
      <Button
        onClick={() => scrapeAllPublishersMut.mutate()}
        disabled={scrapeAllPublishersMut.isPending}
      >
        Scrape All Publishers
      </Button>
    </div>
  );
}
