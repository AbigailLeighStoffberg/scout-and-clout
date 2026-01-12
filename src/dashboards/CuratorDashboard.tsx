import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, MapPin, X, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { api, DropData } from '@/services/api';

interface QuestStep {
  drop_id: string;
  drop_title: string;
  order: number;
}

export default function CuratorDashboard() {
  const { toast } = useToast();
  
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
    toast({ title: 'Step Added', description: `Added "${drop.title}" to your quest.` });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || steps.length === 0) {
      toast({ title: 'Missing fields', description: 'Please fill all fields and add at least one step.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const response = await api.createQuest({
      title,
      description,
      steps: steps.map(s => ({ drop_id: s.drop_id, order: s.order })),
    });

    if (response.success) {
      toast({ title: 'Quest Created', description: 'Your VibList is now live!' });
      setTitle('');
      setDescription('');
      setSteps([]);
    } else {
      toast({ title: 'Error', description: response.error || 'Failed to create quest', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <h1 className="text-3xl font-bold text-foreground">Curator Studio</h1>

        {/* Quest Creator */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Quest Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="quest-title">Quest Title</Label>
                <Input
                  id="quest-title"
                  placeholder="e.g., Omonia Date Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quest-description">Description</Label>
                <Textarea
                  id="quest-description"
                  placeholder="Describe the experience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Step Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Quest Steps</Label>
                  <Dialog open={dropSelectorOpen} onOpenChange={setDropSelectorOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Step
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Select a Drop</DialogTitle>
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
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-colors text-left"
                              >
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground truncate">{drop.title}</h4>
                                  <p className="text-sm text-muted-foreground truncate">{drop.description}</p>
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
                <div className="space-y-2 min-h-[100px] p-4 rounded-lg bg-secondary/30 border border-dashed border-border">
                  {steps.length === 0 ? (
                    <p className="text-muted-foreground text-center text-sm py-6">
                      No steps yet. Click "Add Step" to select drops from the map.
                    </p>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {steps.map((step, index) => (
                        <motion.div
                          key={`${step.drop_id}-${index}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                            {step.order}
                          </span>
                          <span className="flex-1 font-medium text-foreground truncate">{step.drop_title}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveStep(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting || steps.length === 0}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Create Quest
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
