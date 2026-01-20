"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConvexTestPage() {
  const messages = useQuery(api.messages.list, { channelId: "general" });
  const sendMessage = useMutation(api.messages.send);
  
  const [newMessageText, setNewMessageText] = useState("");

  // Temporary fake user ID until we implement real user sync
  // In a real app, this would be current user's ID
  // For this test to work, we might need to create a user first or relax the schema constraints
  // But let's try sending directly. Note: schema expects v.id("users") so we need a valid ID.
  // Since we don't have users yet, let's create a temporary user creation button.
  
  const createUser = useMutation(api.users.createTempUser); 
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!tempUserId) return;
    
    await sendMessage({ 
      body: newMessageText, 
      userId: tempUserId as any, 
      channelId: "general" 
    });
    setNewMessageText("");
  };

  const handleCreateUser = async () => {
     const id = await createUser({ name: "Test User " + Math.floor(Math.random() * 1000) });
     setTempUserId(id);
  };

  return (
    <div className="p-10 max-w-md mx-auto space-y-4 pt-24 text-foreground">
      <h1 className="text-2xl font-bold">Convex Chat Test</h1>
      
      {!tempUserId ? (
         <Button onClick={handleCreateUser}>
           Create Test User to Chat
         </Button>
      ) : (
        <div className="text-green-500 font-mono text-sm">Logged in as ID: {tempUserId}</div>
      )}

      <div className="border border-border p-4 h-64 overflow-y-auto rounded-xl bg-muted/50">
        {messages?.map((msg) => (
          <div key={msg._id} className="mb-3 p-3 bg-card border border-border text-card-foreground rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-70 mb-1">User ID: {msg.userId.slice(0, 8)}...</p>
            <p className="text-base">{msg.body}</p>
          </div>
        ))}
        {messages?.length === 0 && <p className="text-muted-foreground text-center mt-10">Hələ ki mesaj yoxdur.</p>}
      </div>

      <div className="flex gap-2">
        <Input 
          value={newMessageText} 
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
