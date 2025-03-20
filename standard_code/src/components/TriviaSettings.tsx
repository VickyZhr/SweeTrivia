
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TriviaSettings: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-20"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trivia Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            Game settings will appear here in future updates.
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TriviaSettings;
