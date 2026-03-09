import {
  CircleIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';


export const statuses = [
  {
    value: 'PROCESSED',
    label: 'Completed',
    icon: CircleIcon,
  },
  {
    value: 'PENDING',
    label: 'Pending',
    icon: StopwatchIcon,
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
    icon: CrossCircledIcon,
  },
];