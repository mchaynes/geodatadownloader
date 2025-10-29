'use client';

import { Button, Label, Modal, Textarea, TextInput } from 'flowbite-react';
import { useState } from 'react';

type FeedbackModalProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FeedbackModal({
  showModal,
  setShowModal
}: FeedbackModalProps) {
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult('idle');

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE');
    formData.append("subject", "New Feedback from geodatadownloader");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult('success');

        // Reset form safely
        const form = event.currentTarget;
        if (form) {
          form.reset();
        }

        // Close modal after success
        setTimeout(() => {
          setShowModal(false);
          setResult('idle');
        }, 2000);
      } else {
        setResult('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setResult('idle');
  };

  return (
    <Modal show={showModal} size="md" popup onClose={handleClose}>
      <Modal.Header />
      <Modal.Body>
        <form onSubmit={onSubmit} className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Send me your feedback
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            I'd love to hear your thoughts, suggestions, or issues you've encountered.
          </p>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="feedback-email" value="Your email (optional)" />
            </div>
            <TextInput
              id="feedback-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="feedback-message" value="Your message" />
            </div>
            <Textarea
              id="feedback-message"
              name="message"
              placeholder="Thoughts, opinions, bugs, annoyances, your life story..."
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>

          {result === 'success' && (
            <div className="text-green-700 bg-green-50 dark:bg-green-900 dark:text-green-300 rounded-lg p-3 text-sm">
              Thank you for your feedback!
            </div>
          )}

          {result === 'error' && (
            <div className="text-red-700 bg-red-50 dark:bg-red-900 dark:text-red-300 rounded-lg p-3 text-sm">
              Failed to submit feedback. Please try again.
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" color="blue" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button color="gray" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
