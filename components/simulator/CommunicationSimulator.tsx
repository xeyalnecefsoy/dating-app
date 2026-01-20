"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  MessageSquare, 
  BarChart2, 
  RefreshCcw,
  ChevronRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

import { scenarios, analyzeMessage, type Scenario, type AnalysisResult } from "@/lib/simulator-data";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  analysis?: AnalysisResult;
};

export default function CommunicationSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const { language } = useLanguage();
  
  // If no scenario selected, show selection screen. Otherwise show chat.
  if (!selectedScenario) {
    return <ScenarioSelector onSelect={setSelectedScenario} />;
  }

  return (
    <div className="flex h-[800px] w-full max-w-6xl mx-auto border border-border rounded-xl overflow-hidden shadow-2xl bg-card">
      <Sidebar 
        currentScenario={selectedScenario} 
        onSelect={setSelectedScenario} 
      />
      <ChatInterface 
        scenario={selectedScenario} 
        onExit={() => setSelectedScenario(null)}
      />
    </div>
  );
}

function ScenarioSelector({ onSelect }: { onSelect: (s: Scenario) => void }) {
  const { language } = useLanguage();
  
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          {language === 'az' ? 'Məşq üçün Ssenari Seçin' : 'Choose a Scenario to Practice'}
        </h2>
        <p className="text-muted-foreground text-lg">
          {language === 'az' ? 'Realistik situasiyalarda ünsiyyət bacarıqlarınızı artırın.' : 'Master your communication skills in realistic situations.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <Card 
            key={scenario.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-t-4 border-t-transparent hover:border-t-primary group bg-card border-border"
            onClick={() => onSelect(scenario)}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <CardTitle>{scenario.title[language]}</CardTitle>
              <CardDescription>{scenario.description[language]}</CardDescription>
            </CardHeader>
            <CardFooter className="text-primary text-sm font-medium flex items-center">
              {language === 'az' ? 'Məşqə Başla' : 'Start Practice'} <ChevronRight className="w-4 h-4 ml-1" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ currentScenario, onSelect }: { currentScenario: Scenario, onSelect: (s: Scenario) => void }) {
  const { language } = useLanguage();

  return (
    <div className="hidden md:flex flex-col w-80 bg-secondary/10 border-r border-border py-6">
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-lg text-foreground">
          {language === 'az' ? 'Ssenarilər' : 'Scenarios'}
        </h3>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-3",
                currentScenario.id === s.id 
                  ? "bg-card shadow-sm border border-border font-medium text-primary" 
                  : "text-muted-foreground hover:bg-secondary/20"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentScenario.id === s.id ? "bg-green-500" : "bg-muted-foreground/30"
              )} />
              {s.title[language]}
            </button>
          ))}
        </div>
      </ScrollArea>
      <div className="px-6 mt-auto">
         <Card className="bg-primary/5 border-none">
            <CardContent className="p-4">
               <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                  <BarChart2 className="w-4 h-4" /> 
                  {language === 'az' ? 'İnkişafınız' : 'Your Progress'}
               </div>
               <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                     <span>{language === 'az' ? 'Ort. Empatiya' : 'Avg. Empathy'}</span>
                     <span>78%</span>
                  </div>
                  <Progress value={78} className="h-1" />
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function ChatInterface({ scenario, onExit }: { scenario: Scenario, onExit: () => void }) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTone, setCurrentTone] = useState<AnalysisResult["tone"]>("Neutral");
  
  // Initialize with the scenario's starting message
  useEffect(() => {
    setMessages([{
      id: "init",
      sender: "ai",
      text: scenario.initialMessage[language],
      timestamp: new Date()
    }]);
    setInputValue("");
    setCurrentTone("Neutral");
  }, [scenario, language]);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
        // Simple timeout to allow DOM to update
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
  }, [messages]);

  // Real-time tone analysis (debounced slightly in practice, or just direct for now)
  useEffect(() => {
    if (!inputValue) {
       setCurrentTone("Neutral");
       return;
    }
    const analysis = analyzeMessage(inputValue, language);
    setCurrentTone(analysis.tone);
  }, [inputValue, language]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsgText = inputValue;
    const analysis = analyzeMessage(userMsgText, language);
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date(),
      analysis: analysis
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: language === 'az' 
          ? "Bu maraqlı yanaşmadır! Niyə belə düşündüyünü mənə daha ətraflı danış." 
          : "That's an interesting perspective! Tell me more about why you feel that way.", // Mock response for now
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const tones = {
    "Friendly": language === 'az' ? 'Dostcasına' : 'Friendly',
    "Assertive": language === 'az' ? 'İddialı' : 'Assertive',
    "Shy": language === 'az' ? 'Utancaq' : 'Shy',
    "Neutral": language === 'az' ? 'Neytral' : 'Neutral',
    "Aggressive": language === 'az' ? 'Aqressiv' : 'Aggressive'
  };

  return (
    <div className="flex-1 flex flex-col bg-background/50">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={scenario.persona.avatar} />
            <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">{scenario.persona.name}</h4>
            <p className="text-xs text-muted-foreground">{scenario.persona.role[language]}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
           {language === 'az' ? 'Sessiyanı Bitir' : 'End Session'}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn(
                "flex gap-4",
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
               <Avatar className="w-8 h-8 mt-1">
                  {msg.sender === "ai" ? (
                      <>
                        <AvatarImage src={scenario.persona.avatar} />
                        <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
                      </>
                  ) : (
                      <AvatarFallback className="bg-primary/20 text-primary">Me</AvatarFallback>
                  )}
               </Avatar>
               
               <div className={cn("flex flex-col max-w-[80%]", msg.sender === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.sender === "user" 
                      ? "bg-primary text-white rounded-br-none" 
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                  
                  {/* Analysis Feedback for User Messages */}
                  {msg.sender === "user" && msg.analysis && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-2 w-full"
                    >
                      <Card className="bg-primary/5 border-primary/20 shadow-none">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium text-primary">AI Analiz</span>
                             </div>
                             <Badge variant="secondary" className="text-[10px] h-5">{tones[msg.analysis.tone] || msg.analysis.tone}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{msg.analysis.feedback[language]}</p>
                          <div className="grid grid-cols-3 gap-2">
                             <Stat label={language === 'az' ? 'Empatiya' : 'Empathy'} value={msg.analysis.empathy} />
                             <Stat label={language === 'az' ? 'Aydınlıq' : 'Clarity'} value={msg.analysis.clarity} />
                             <Stat label={language === 'az' ? 'İnam' : 'Confidence'} value={msg.analysis.confidence} />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
               </div>
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <Avatar className="w-8 h-8 mt-1">
                   <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-none">
                   <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-75" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150" />
                   </div>
                </div>
             </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-card border-t border-border p-4 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2 px-1">
             <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {language === 'az' ? 'Tonunuz:' : 'Your Tone:'}
                </span>
                <Badge variant={currentTone === "Neutral" ? "outline" : "default"} className={cn(
                    "transition-colors duration-300",
                    currentTone === "Friendly" && "bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                    currentTone === "Assertive" && "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
                    currentTone === "Shy" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                    currentTone === "Neutral" && "text-muted-foreground"
                )}>
                  {tones[currentTone] || currentTone}
                </Badge>
             </div>
             {inputValue.length > 0 && (
               <span className="text-[10px] text-muted-foreground animate-pulse">
                  {language === 'az' ? 'Analiz edilir...' : 'Analyzing...'}
               </span>
             )}
          </div>
          <div className="relative">
             <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'az' ? 'Cavabınızı yazın...' : 'Type your response...'}
                className="pr-12 resize-none min-h-[80px] text-base bg-background border-border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
             />
             <Button 
                size="icon" 
                className="absolute bottom-3 right-3 h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
             >
                <Send className="w-4 h-4" />
             </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
             {language === 'az' 
               ? 'AI cavabınızı empatiya, aydınlıq və inam üçün analiz edir.' 
               : 'AI analyzes your response for empathy, clarity, and confidence.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: number }) {
   return (
      <div className="space-y-1">
         <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>{label}</span>
            <span>{value}%</span>
         </div>
         <Progress value={value} className="h-1.5" />
      </div>
   );
}
