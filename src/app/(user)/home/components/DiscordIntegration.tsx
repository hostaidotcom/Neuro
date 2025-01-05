// DiscordIntegration.tsx

'use client';

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IntegrationCard } from "./integration-card";
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;
const DISCORD_BOT_TOKEN = process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN; // Add the bot token to the env variables.
const DISCORD_GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID // The id of the Discord server.
const DISCORD_EAP_ROLE_ID = process.env.NEXT_PUBLIC_DISCORD_EAP_ROLE_ID // The id of the EAP role in Discord.
const DISCORD_EAP_CHANNEL_ID = process.env.NEXT_PUBLIC_DISCORD_EAP_CHANNEL_ID // The id of the EAP Channel.
const PRIVY_API_URL = process.env.NEXT_PUBLIC_PRIVY_API_URL // Add the URL of the Privy API that has the user's info.
const PRIVY_API_KEY = process.env.NEXT_PUBLIC_PRIVY_API_KEY // The API Key for Privy

export function DiscordIntegration() {
        const searchParams = useSearchParams();
        const code = searchParams.get("code");

        useEffect(() => {
            if(code) {
                handleDiscordCallback(code);
            }
        }, [code]);

        const handleDiscordConnect = () => {
        if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
          toast.error('Discord integration is not configured correctly');
          return;
        }

        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join`;

        window.location.href = discordAuthUrl;
    };

        const handleDiscordCallback = async (code: string) => {
            try {
                // Exchange code for token
                const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                    client_id: DISCORD_CLIENT_ID!,
                    client_secret: process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET!,
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: DISCORD_REDIRECT_URI!,
                  }),
                });

                if (!tokenResponse.ok) {
                    toast.error("Failed to get token from Discord.")
                    return;
                }

                const tokenData = await tokenResponse.json();
                const accessToken = tokenData.access_token;

                 // Get User Info
                const userResponse = await fetch("https://discord.com/api/users/@me", {
                    headers: {
                    Authorization: `Bearer ${accessToken}`,
                    },
                 });

                 if (!userResponse.ok) {
                    toast.error("Failed to get user information from Discord.")
                    return;
                 }

                 const userData = await userResponse.json();
                 const discordUserId = userData.id;

                // Get Guilds Info
                const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
                    headers: {
                    Authorization: `Bearer ${accessToken}`,
                    },
                });
                
                if (!guildsResponse.ok) {
                    toast.error("Failed to get user guilds from Discord.")
                    return;
                }
                
                const guildsData = await guildsResponse.json();
                const isUserOnGuild = guildsData.some((guild: { id: string }) => guild.id === DISCORD_GUILD_ID)
                
                if (!isUserOnGuild) {
                    toast.error("You're not on the configured Discord server.")
                    return;
                }

                 // Get User's Privy status (Replace with your actual Privy API call)
                const privyResponse = await fetch(`${PRIVY_API_URL}/${discordUserId}`, {
                    headers: {
                      "Authorization": `Bearer ${PRIVY_API_KEY}`,
                      "Content-Type": "application/json"
                    }
                });
        
               if (!privyResponse.ok) {
                  toast.error("Failed to get user's status from Privy.");
                  return;
                }

                const privyData = await privyResponse.json();
                const isEAPUser = privyData.earlyAccess;

                if (isEAPUser) {
                //Assign Discord Role and give channel access (Only to EAP users)

                    const roleResponse = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}/roles/${DISCORD_EAP_ROLE_ID}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                        }
                    });
                    if(!roleResponse.ok) {
                        toast.error("Failed to assign the EAP role to the user.")
                    }
                    
                      const channelResponse = await fetch(`https://discord.com/api/channels/${DISCORD_EAP_CHANNEL_ID}/permissions/${discordUserId}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            allow: "1024"
                        })
                    });

                    if(!channelResponse.ok) {
                        toast.error("Failed to give the user access to the EAP channel.")
                        return;
                   }
                   toast.success("You are now connected to Discord and have been given the proper access!")
                 } else {
                     toast.success("You are now connected to Discord!")
                 }
            } catch (error) {
                toast.error("An error occurred during Discord authorization.");
                console.error("Discord auth error:", error);
           }
        };
    const discordIntegration = {
        icon: 'integrations/discord.svg',
        label: 'Discord',
        description: 'Connect your Discord account',
        theme: {
          primary: '#5865F2', // Discord Brand Color
          secondary: '#5865F2',
        },
      };
  return (
    <IntegrationCard
        item={discordIntegration}
        onClick={handleDiscordConnect}
        >
        <Button onClick={handleDiscordConnect}>Connect</Button>
     </IntegrationCard>
  );
}