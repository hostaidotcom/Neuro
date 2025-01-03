import { z } from "zod";
import { Card } from "@/components/ui/card";
import { fetchPriceHistory } from "@/server/actions/price";
import PriceChart from "@/components/message/price-chart";

export const tokenPriceChartTool = {
  priceFetch: {  
  displayName: "📈 Token Price Chart",
  isCollapsible: false,
  description: "Displays the price history chart of a Solana token in USD for a given duration.",
  parameters: z.object({
    tokenSymbol: z.string().describe("The Solana token symbol"),
    daysToFetch: z.number().optional().describe("Number of days for price history (defaults to 7 days)"),
  }),
  execute: async ({ tokenSymbol, daysToFetch }: { tokenSymbol: string; daysToFetch?: number }) => {
    try {
      const tokenPriceHistory = await fetchPriceHistory(tokenSymbol, daysToFetch || 7);
      return {
        success: true,
        data: tokenPriceHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to fetch token price history",
      };
    }
  },
  render: (response: unknown) => {
    const parsedResponse = response as {
      success: boolean;
      data?: { time: string; value: number }[];
      error?: string;
    };

    if (!parsedResponse.success) {
      return <div>Error: {parsedResponse.error}</div>;
    }

    if (!parsedResponse.data || parsedResponse.data.length === 0) {
      return <div>No price history data available</div>;
    }

    return (
      <Card className="bg-muted/50 p-4">
        <h3>Token Price Chart</h3>
        <PriceChart data={parsedResponse.data} />
      </Card>
    );
  },
}
};
