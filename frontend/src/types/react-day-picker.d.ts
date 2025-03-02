// Add this file to help with the type definitions for react-day-picker
import 'react-day-picker';

declare module 'react-day-picker' {
  // Extend the existing CustomComponents interface with our custom icons
  interface CustomComponents {
    IconLeft?: (props: any) => JSX.Element;
    IconRight?: (props: any) => JSX.Element;
  }
} 