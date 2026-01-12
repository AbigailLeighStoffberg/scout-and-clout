import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, MapPin, Loader2, GripVertical, Trash2, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlassCard } from '@/components/ui/glass-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { api, DropData } from '@/services/api';

interface QuestStep {
  drop_id: string;
  drop_title: string;
  order: number;
}

export function QuestCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [drops, setDrops] = useState<DropData[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dropSelectorOpen, setDropSelectorOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<QuestStep[]>([]);

  useEffect(() => {
    const fetchDrops = async () => {
      const response = await api.getDrops();
      if (response.success && response.data) {
        setDrops(response.data);
      }
      setLoadingDrops(false);
    };
    fetchDrops();
  }, []);

  const handleAddStep = (drop: DropData) => {
    const newStep: QuestStep = {
      drop_id: drop.id,
      drop_title: drop.title,
      order: steps.length + 1,
    };
    setSteps([...steps, newStep]);
    setDropSelectorOpen(false);
    toast.success(`Added "${drop.title}" to your Quest Line.`);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || steps.length === 0) {
      toast.error('Please fill all fields and add at least one stop.');
      return;
    }

    setSubmitting(true);
    const response = await api.createQuest({
      title,
      description,
      steps: steps.map(s => ({ drop_id: s.drop_id, order: s.order })),
    });

    if (response.success) {
      toast.success('Your Quest Line is now live!');
      setTitle('');
      setDescription('');
      setSteps([]);
    } else {
      toast.error(response.error || 'Failed to create Quest Line');
    }
    setSubmitting(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <GlassCard className="overflow-hidden relative">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#A759D8]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header with collapse toggle */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-heading font-semibold text-white">Quest Creator</h4>
                  <p className="text-xs text-muted-foreground">Build curated Quest Lines</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* Quest Title */}
                      <div className="space-y-1.5">
                        <Label htmlFor="quest-title" className="text-xs text-slate-400">Quest Line Title</Label>
                        <Input
                          id="quest-title"
                          placeholder="e.g., Date Night Downtown"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-[#A759D8]/50"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <Label htmlFor="quest-description" className="text-xs text-slate-400">Description</Label>
                        <Input
                          id="quest-description"
                          placeholder="A short description..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-[#A759D8]/50"
                        />
                      </div>
                    </div>

                    {/* Step Builder */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-400">Experience Stops</Label>
                        <Dialog open={dropSelectorOpen} onOpenChange={setDropSelectorOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="border-[#A759D8]/30 hover:border-[#A759D8] hover:bg-[#A759D8]/10 text-slate-300">
                              <Plus className="w-3 h-3 mr-1" />
                              Add Stop
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Select a Drop</DialogTitle>
                            </DialogHeader>
                            {loadingDrops ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                              </div>
                            ) : drops.length === 0 ? (
                              <p className="text-muted-foreground text-center py-8">No drops available.</p>
                            ) : (
                              <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-2">
                                  {drops.map((drop) => (
                                    <button
                                      key={drop.id}
                                      type="button"
                                      onClick={() => handleAddStep(drop)}
                                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors text-left"
                                    >
                                      <MapPin className="w-4 h-4 text-[#18C5DC] shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate text-sm">{drop.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">{drop.description}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Steps List */}
                      <div className="min-h-[80px] p-3 rounded-xl bg-slate-800/30 border border-dashed border-slate-700">
                        {steps.length === 0 ? (
                          <p className="text-muted-foreground text-center text-xs py-4">
                            No stops yet. Click "Add Stop" to build your Quest Line.
                          </p>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            <div className="space-y-2">
                              {steps.map((step, index) => (
                                <motion.div
                                  key={`${step.drop_id}-${index}`}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700"
                                >
                                  <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                                  <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #A759D8, #DB529F)' }}>
                                    {step.order}
                                  </span>
                                  <span className="flex-1 font-medium text-white truncate text-sm">{step.drop_title}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveStep(index)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          </AnimatePresence>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full text-white font-semibold" 
                      style={{ background: "linear-gradient(to right, #A759D8, #DB529F)" }}
                      disabled={submitting || steps.length === 0}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Publish Quest Line
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </div>
      </GlassCard>
    </Collapsible>
  );
}
