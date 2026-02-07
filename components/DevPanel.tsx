"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/toast";
import { Wrench, Heart, MessageCircle, Handshake } from "lucide-react";

export default function DevPanel() {
  const { user } = useUser();
  const { showToast } = useToast();
  const allUsers = useQuery(api.users.getActiveUsers, { 
    currentUserId: user?.id 
  }) || [];
  
  // Filter for mock users (assuming they have specific IDs or just listing all except self)
  // Mock users from seed have clerkId starting with "mock_"
  const mockUsers = allUsers.filter(u => u.clerkId?.startsWith("mock_") && u.clerkId !== user?.clerkId);

  const simulateLike = useMutation(api.dev.simulateLike);
  const simulateMatch = useMutation(api.dev.simulateMatch);
  const simulateMessage = useMutation(api.dev.simulateMessage);
  const reset = useMutation(api.dev.reset);
  const deleteMocks = useMutation(api.dev.deleteMockUsers);

  const handleLike = async (mockId: string, name: string) => {
    if (!user?.id) return;
    try {
      const result = await simulateLike({ likerId: mockId, targetId: user.id });
      showToast({
        title: name,
        message: result.message,
        type: result.success ? "success" : "error",
      });
    } catch (error) {
      showToast({ title: "Error", message: "Failed to simulate like", type: "error" });
    }
  };

  const handleMatch = async (mockId: string, name: string) => {
    if (!user?.id) return;
    try {
      const result = await simulateMatch({ user1Id: mockId, user2Id: user.id });
      showToast({
        title: name,
        message: result.message,
        type: result.success ? "match" : "error",
      });
    } catch (error) {
      showToast({ title: "Error", message: "Failed to simulate match", type: "error" });
    }
  };

  const handleMessage = async (mockId: string, name: string) => {
    if (!user?.id) return;
    try {
      const result = await simulateMessage({ 
        senderId: mockId, 
        receiverId: user.id,
        content: `Hey! This is a test message from ${name}. 👋`
      });
      showToast({
        title: name,
        message: result.message,
        type: result.success ? "message" : "error",
      });
    } catch (error) {
        console.error(error);
      showToast({ title: "Error", message: "Failed to simulate message. Make sure you are matched first!", type: "error" });
    }
  };

  return (
    <Card className="w-full mt-8 border-dashed border-2 border-yellow-500/50 bg-yellow-500/5 relative">
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Wrench className="w-5 h-5" />
            Developer Simulation Panel
          </CardTitle>
          <div className="flex gap-2 relative z-10">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                onClick={async () => {
                if (!user) return;
                try {
                     await reset({ userId: user.id });
                     localStorage.removeItem(`danyeri-user-${user.id}`);
                     window.location.reload();
                } catch (e) {
                     console.error(e);
                }
                }}
            >
                Sıfırla
            </Button>
            <Button
                variant="destructive"
                size="sm"
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                onClick={async () => {
                    if (confirm("Bütün mock istifadəçiləri bazadan silmək istədiyinizə əminsiniz?")) {
                        await deleteMocks({});
                        window.location.reload();
                    }
                }}
            >
                Mockları Sil
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Simulate interactions from mock users to test your profile notifications and chats.
        </p>
        
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {mockUsers.map((mockUser) => (
              <div key={mockUser._id} className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={mockUser.avatar} />
                    <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">{mockUser.name}</h4>
                    <Badge variant="outline" className="text-xs">{mockUser.age} • {mockUser.location}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleLike(mockUser.clerkId!, mockUser.name)} title="Target Likes Me">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleMatch(mockUser.clerkId!, mockUser.name)} title="Force Match">
                    <Handshake className="w-4 h-4 text-purple-500" />
                  </Button>
                   <Button size="icon" variant="outline" onClick={() => handleMessage(mockUser.clerkId!, mockUser.name)} title="Send Me Message">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            ))}
            {mockUsers.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No mock users found in database with clerkId starting with "mock_".
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
