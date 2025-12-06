import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertTriangle } from "lucide-react";
import { ReportService } from "../utils/services";
import { AuthService } from "../utils/auth";
import { toast } from "sonner";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'listing' | 'user' | 'message' | 'review' | 'deal';
  contentId: string;
  contentTitle?: string;
  onAuthRequired: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fraud', label: 'Fraudulent or scam' },
  { value: 'counterfeit', label: 'Counterfeit product' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'intellectual_property', label: 'Intellectual property violation' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
  onAuthRequired
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    const accessToken = await AuthService.getFreshToken();
    if (!accessToken) {
      onAuthRequired();
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await ReportService.createReport(accessToken, {
        contentType,
        contentId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success('Report submitted successfully', {
          description: 'Thank you for helping keep our community safe. We\'ll review your report shortly.',
          duration: 4000
        });
        // Reset form and close
        setSelectedReason('');
        setDescription('');
        onClose();
      } else {
        toast.error('Failed to submit report', {
          description: result.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Report {contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1) : 'Content'}</span>
          </DialogTitle>
          <DialogDescription>
            {contentTitle && (
              <span className="block mb-2">Reporting: <strong>{contentTitle}</strong></span>
            )}
            Help us understand what's wrong with this {contentType || 'content'}. All reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for report *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional information that might help us review this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Your report is anonymous and will not be shared with the reported party.
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Before you submit:</p>
                <ul className="space-y-1">
                  <li>• False reports may result in account restrictions</li>
                  <li>• We take all reports seriously and will investigate thoroughly</li>
                  <li>• You may be contacted if we need more information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}