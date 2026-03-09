import {
  CircleIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';


export const statuses = [
  {
    value: 'ACCEPTED',
    label: 'Accept',
    icon: CircleIcon,
  },
  {
    value: 'PENDING',
    label: 'Pending',
    icon: StopwatchIcon,
  },
  {
    value: 'CANCELLED',
    label: 'Canceled',
    icon: CrossCircledIcon,
  },
];