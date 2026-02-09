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

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { scenarios, type Scenario, type AnalysisResult } from "@/lib/simulator-data";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  analysis?: AnalysisResult;
};

export default function CommunicationSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { language } = useLanguage();
  
  // Reset messages when scenario changes
  useEffect(() => {
    if (selectedScenario) {
        setMessages([]);
    }
  }, [selectedScenario]);

  // Calculate average stats
  const userMessages = messages.filter(m => m.sender === "user" && m.analysis);
  const avgEmpathy = userMessages.length > 0 
     ? Math.round(userMessages.reduce((sum, m) => sum + (m.analysis?.empathy || 0), 0) / userMessages.length)
     : 0;
  // We can add clarity/confidence here too if needed for more stats

  // If no scenario selected, show selection screen. Otherwise show chat.
  if (!selectedScenario) {
    return <ScenarioSelector onSelect={setSelectedScenario} />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] w-full max-w-6xl mx-auto border border-border rounded-xl overflow-hidden shadow-2xl bg-card min-w-0">
      <Sidebar 
        currentScenario={selectedScenario} 
        onSelect={setSelectedScenario} 
        avgEmpathy={avgEmpathy}
        messageCount={userMessages.length}
      />
      <ChatInterface 
        scenario={selectedScenario} 
        onExit={() => setSelectedScenario(null)}
        onSelect={setSelectedScenario}
        messages={messages}
        setMessages={setMessages}
        avgEmpathy={avgEmpathy}
        messageCount={userMessages.length}
      />
    </div>
  );
}


import { useUser } from "@/contexts/UserContext";

function ScenarioSelector({ onSelect }: { onSelect: (s: Scenario) => void }) {
  const { language } = useLanguage();
  const { user } = useUser();

  // Filter scenarios based on user gender (show opposite gender)
  // If user gender is unknown, show all
  const filteredScenarios = scenarios.filter(s => {
    if (!user?.gender) return true;
    const targetGender = user.gender === "male" ? "female" : "male";
    return s.persona.gender === targetGender;
  });

  // Fallback if no scenarios match (shouldn't happen but good safety)
  const displayScenarios = filteredScenarios.length > 0 ? filteredScenarios : scenarios;
  
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
        {displayScenarios.map((scenario) => (
          <Card 
            key={scenario.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-t-4 border-t-transparent hover:border-t-primary group bg-card border-border"
            onClick={() => onSelect(scenario)}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={scenario.persona.avatar} />
                  <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
                </Avatar>
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


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

function Sidebar({ 
  currentScenario, 
  onSelect, 
  avgEmpathy,
  messageCount 
}: { 
  currentScenario: Scenario, 
  onSelect: (s: Scenario) => void,
  avgEmpathy: number,
  messageCount: number
}) {
  return (
    <div className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 bg-secondary/10 border-r border-border py-6 h-full transition-all duration-300">
      <SidebarContent 
        currentScenario={currentScenario}
        onSelect={onSelect}
        avgEmpathy={avgEmpathy}
        messageCount={messageCount}
      />
    </div>
  );
}

function SidebarContent({
  currentScenario, 
  onSelect, 
  avgEmpathy,
  messageCount,
  onMobileClose
}: { 
  currentScenario: Scenario, 
  onSelect: (s: Scenario) => void,
  avgEmpathy: number,
  messageCount: number,
  onMobileClose?: () => void
}) {
    const { language } = useLanguage();
    const { user } = useUser();
  
    // Filter scenarios here too
    const filteredScenarios = scenarios.filter(s => {
      if (!user?.gender) return true;
      const targetGender = user.gender === "male" ? "female" : "male";
      return s.persona.gender === targetGender;
    });
    
    const displayScenarios = filteredScenarios.length > 0 ? filteredScenarios : scenarios;
  
    return (
      <div className="flex flex-col h-full w-full">
        <div className="px-6 mb-6 shrink-0 lg:block hidden">
            <h3 className="font-semibold text-lg text-foreground">
            {language === 'az' ? 'Ssenarilər' : 'Scenarios'}
            </h3>
        </div>

        <ScrollArea className="flex-1 px-4 min-h-0">
            <div className="space-y-2">
            {displayScenarios.map((s) => (
                <button
                key={s.id}
                onClick={() => {
                    onSelect(s);
                    if (onMobileClose) onMobileClose();
                }}
                className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-3",
                    currentScenario.id === s.id 
                    ? "bg-card shadow-sm border border-border font-medium text-primary" 
                    : "text-muted-foreground hover:bg-secondary/20"
                )}
                >
                <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage src={s.persona.avatar} />
                    <AvatarFallback>{s.persona.name[0]}</AvatarFallback>
                </Avatar>
                <span className="truncate">{s.title[language]}</span>
                </button>
            ))}
            </div>
        </ScrollArea>
        
        <div className="px-6 mt-4 shrink-0 pb-6 lg:pb-0">
            <Card className="bg-primary/5 border-none">
                <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                    <BarChart2 className="w-4 h-4" /> 
                    {language === 'az' ? 'İnkişafınız' : 'Your Progress'}
                </div>
                {messageCount > 0 ? (
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                        <span>{language === 'az' ? 'Ort. Empatiya' : 'Avg. Empathy'}</span>
                        <span>{avgEmpathy}%</span>
                        </div>
                        <Progress value={avgEmpathy} className="h-1" />
                        <p className="text-[10px] mt-2 opacity-70">
                        {language === 'az' 
                            ? `${messageCount} mesaj analiz edildi` 
                            : `Based on ${messageCount} messages`}
                        </p>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground text-center py-2 opacity-70">
                    {language === 'az' ? 'Statistika üçün söhbətə başlayın' : 'Start chatting to see stats'}
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    );
}


// Update ChatInterface props to include selection and stats for mobile menu
function ChatInterface({ 
  scenario, 
  onExit,
  onSelect,
  messages,
  setMessages,
  avgEmpathy,
  messageCount
}: { 
  scenario: Scenario, 
  onExit: () => void,
  onSelect: (s: Scenario) => void,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  avgEmpathy: number,
  messageCount: number
}) {
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTone, setCurrentTone] = useState<AnalysisResult["tone"]>("Neutral");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize with the scenario's starting message ONLY if empty (first load of scenario)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "init",
        sender: "ai",
        text: scenario.initialMessage[language],
        timestamp: new Date()
      }]);
    }
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
  }, [messages, isTyping]);

  const chatWithDeepSeek = useAction(api.ai.chatWithDeepSeek);
  const [analyzingInput, setAnalyzingInput] = useState(false);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsgText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);
    // Don't reset tone immediately, wait for new analysis to update it
    
    try {
      const history = messages.map(m => ({
        role: m.sender === "user" ? "user" as const : "assistant" as const,
        content: m.text
      }));

      const context = `
Persona: ${scenario.persona.name}
Role: ${scenario.persona.role[language]}
Scenario Title: ${scenario.title[language]}
Scenario Description: ${scenario.description[language]}
Initial Message: ${scenario.initialMessage[language]}
`;

      const result = await chatWithDeepSeek({
        userMessage: userMsgText,
        history,
        scenarioContext: context,
        language
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: result.response,
        timestamp: new Date()
      };
      
      setMessages(prev => {
        const updated = [...prev];
        const userMsgIndex = updated.findIndex(m => m.id === newUserMsg.id);
        if (userMsgIndex !== -1) {
           updated[userMsgIndex] = {
             ...updated[userMsgIndex],
             analysis: result.analysis
           };
        }
        return [...updated, aiResponse];
      });
      
      // Update Tone based on latest analysis
      if (result.analysis && result.analysis.tone) {
          setCurrentTone(result.analysis.tone);
      }

    } catch (error) {
       console.error("AI Error:", error);
       const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         sender: "ai",
         text: language === 'az' 
           ? "Bağışlayın, hazırda cavab verə bilmirəm." 
           : "Sorry, I'm having trouble responding right now.",
         timestamp: new Date()
       };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
       setIsTyping(false);
    }
  };

  const tones = {
    "Friendly": language === 'az' ? 'Dostcasına' : 'Friendly',
    "Assertive": language === 'az' ? 'İddialı' : 'Assertive',
    "Shy": language === 'az' ? 'Utancaq' : 'Shy',
    "Neutral": language === 'az' ? 'Neytral' : 'Neutral',
    "Aggressive": language === 'az' ? 'Aqressiv' : 'Aggressive'
  };

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full min-h-0 min-w-0">
      {/* Header */}
      <div className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
            {/* Mobile/Tablet/Laptop Menu Trigger */}
            <div className="xl:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2 mr-1">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[85vw] sm:w-80 bg-background border-r">
                         <SheetHeader className="px-6 pt-6 pb-2 text-left">
                            <SheetTitle>
                                {language === 'az' ? 'Ssenarilər' : 'Scenarios'}
                            </SheetTitle>
                         </SheetHeader>
                        <SidebarContent 
                            currentScenario={scenario} 
                            onSelect={onSelect}
                            avgEmpathy={avgEmpathy}
                            messageCount={messageCount}
                            onMobileClose={() => setIsMobileMenuOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            </div>

          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={scenario.persona.avatar} />
            <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground text-sm md:text-base">{scenario.persona.name}</h4>
            <p className="text-[10px] md:text-xs text-muted-foreground">{scenario.persona.role[language]}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit} className="text-xs md:text-sm">
           {language === 'az' ? 'Bitir' : 'End'}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-6 h-full">
        <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto pb-4">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn(
                "flex gap-2 md:gap-4",
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
               <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-1">
                  {msg.sender === "ai" ? (
                      <>
                        <AvatarImage src={scenario.persona.avatar} />
                        <AvatarFallback>{scenario.persona.name[0]}</AvatarFallback>
                      </>
                  ) : (
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px] md:text-xs">Me</AvatarFallback>
                  )}
               </Avatar>
               
               <div className={cn("flex flex-col max-w-[85%] md:max-w-[80%]", msg.sender === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-2 md:px-5 md:py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
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
          <div ref={scrollRef} className="pb-2" />
        </div>
      </ScrollArea>


      {/* Suggestions */}
      {messages.length > 0 && messages[messages.length - 1].sender === "ai" && !isTyping && (
         <div className="px-4 md:px-6 pb-2 w-full max-w-full">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full mask-linear-fade">
               {scenario.suggestions[language].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion)}
                    className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 bg-secondary/50 hover:bg-secondary text-[11px] md:text-xs rounded-full border border-border/50 transition-colors text-foreground/80 hover:text-foreground shrink-0"
                  >
                    {suggestion}
                  </button>
               ))}
            </div>
         </div>
      )}

      {/* Input Area */}
      <div className="bg-card border-t border-border p-3 md:p-4 md:px-6 shrink-0 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
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
