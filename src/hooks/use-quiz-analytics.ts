import { useEffect, useRef, useCallback } from 'react';
import {
  trackQuizStep,
  trackQuizAbandonment,
  trackStepDuration,
  startStepTimer,
  getDeviceType,
  QuizStep,
} from '@/lib/analytics';

interface QuizAnalyticsOptions {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  service?: string;
  serviceType?: string;
  location?: string;
  timing?: string;
  contactMethod?: string;
  totalValue?: number;
}

/**
 * Hook for comprehensive quiz funnel analytics
 * Tracks step progression, time spent, abandonment, and conversions
 */
export function useQuizAnalytics({
  isOpen,
  currentStep,
  totalSteps,
  service,
  serviceType,
  location,
  timing,
  contactMethod,
  totalValue,
}: QuizAnalyticsOptions) {
  const lastTrackedStep = useRef<number>(0);
  const hasTrackedStart = useRef(false);
  const wasOpen = useRef(false);

  // Track quiz open
  useEffect(() => {
    if (isOpen && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      startStepTimer();
      trackQuizStep('start', 0, {
        service: getDeviceType(),
      });
    }
  }, [isOpen]);

  // Track step changes
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentStep > lastTrackedStep.current) {
      // Track previous step duration
      if (lastTrackedStep.current > 0) {
        trackStepDuration(lastTrackedStep.current);
      }
      
      // Start timer for new step
      startStepTimer();
      
      // Determine step event name
      let stepName: QuizStep = 'start';
      switch (currentStep) {
        case 1:
          stepName = 'service_selected';
          break;
        case 2:
          stepName = 'details_completed';
          break;
        case 3:
          stepName = 'location_selected';
          break;
        case 4:
          stepName = 'timing_selected';
          break;
        case 5:
          stepName = 'contact_filled';
          break;
        case 6:
          stepName = 'method_selected';
          break;
        case 7:
          stepName = 'submitted';
          break;
      }
      
      trackQuizStep(stepName, currentStep, {
        service,
        serviceType,
        location,
        timing,
        contactMethod,
        totalValue,
      });
      
      lastTrackedStep.current = currentStep;
    }
  }, [currentStep, isOpen, service, serviceType, location, timing, contactMethod, totalValue]);

  // Track abandonment when quiz closes
  useEffect(() => {
    wasOpen.current = isOpen;
    
    return () => {
      // Only track abandonment if quiz was open and not completed
      if (wasOpen.current && lastTrackedStep.current > 0 && lastTrackedStep.current < totalSteps) {
        trackQuizAbandonment(lastTrackedStep.current, totalSteps, service);
      }
    };
  }, [isOpen, totalSteps, service]);

  // Reset tracking state when quiz closes
  useEffect(() => {
    if (!isOpen) {
      // Don't reset if successfully submitted (step 7)
      if (lastTrackedStep.current < totalSteps) {
        hasTrackedStart.current = false;
        lastTrackedStep.current = 0;
      }
    }
  }, [isOpen, totalSteps]);

  // Track submission success
  const trackSubmission = useCallback(() => {
    trackStepDuration(currentStep);
    trackQuizStep('submitted', totalSteps, {
      service,
      serviceType,
      location,
      timing,
      contactMethod,
      totalValue,
    });
    
    // Reset tracking state after successful submission
    hasTrackedStart.current = false;
    lastTrackedStep.current = totalSteps; // Mark as completed to prevent abandonment tracking
  }, [currentStep, totalSteps, service, serviceType, location, timing, contactMethod, totalValue]);

  return { trackSubmission };
}
