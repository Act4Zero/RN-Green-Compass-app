import { BadgeTriggerFn, BadgeRule } from './types';
import { dailyFlowBadgeRules, nightOwlTrigger } from './triggers/dailyFlow';
import { habitTrackerBadgeRules, firstHabitTrigger, fiveHabitsTrigger, habitStreak7Trigger } from './triggers/habitTracker';

/**
 * Generic trigger generator for field/op/value rules
 * Creates functions that check profile fields against values
 */
export function makeFieldTrigger(field: string, op: string, value: number): BadgeTriggerFn {
  return ({ profile }) => {
    // Get the field value, defaulting to 0 if undefined
    const fieldValue = profile[field];
    
    // Convert to number for comparison (if it's not already a number)
    const numValue = typeof fieldValue === 'number' ? fieldValue : 
                     typeof fieldValue === 'string' ? parseInt(fieldValue, 10) : 0;
    
    // Perform comparison based on the operator
    switch (op) {
      case '>=': return numValue >= value;
      case '==': return numValue === value;
      case '>': return numValue > value;
      case '<': return numValue < value;
      case '<=': return numValue <= value;
      default: return false;
    }
  };
}

/**
 * Map of all custom trigger functions that can't be expressed as simple field/op/value
 */
const customTriggers: Record<string, BadgeTriggerFn> = {
  // Daily Flow triggers
  'night_owl_login': nightOwlTrigger,
  
  // Habit Tracker triggers
  'first_habit': firstHabitTrigger,
  'five_habits': fiveHabitsTrigger,
  'habit_streak_7': habitStreak7Trigger,
};

/**
 * Generates the complete badge trigger registry by combining:
 * 1. All the declarative rules converted to trigger functions
 * 2. All the custom trigger functions
 */
function buildTriggerRegistry(): Record<string, BadgeTriggerFn> {
  const allRules: BadgeRule[] = [
    ...dailyFlowBadgeRules,
    ...habitTrackerBadgeRules,
    // Add more badge rules from other categories here
  ];
  
  // Start with all custom triggers
  const registry: Record<string, BadgeTriggerFn> = { ...customTriggers };
  
  // Add all declarative rule-based triggers
  allRules.forEach(rule => {
    // Skip custom triggers already defined
    if (rule.custom) return;
    
    // Create triggers for declarative rules
    if (rule.field && rule.op && rule.value !== undefined) {
      registry[rule.code] = makeFieldTrigger(rule.field, rule.op, rule.value);
    }
  });
  
  return registry;
}

/**
 * The complete trigger registry for all badge codes
 */
export const badgeTriggerRegistry = buildTriggerRegistry();
