import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';


export const statuses = [
  {
    value: 'REJECTED',
    label: 'Rejected',
    icon: QuestionMarkCircledIcon,
  },
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
    value: 'COMPLETED',
    label: 'Done',
    icon: CheckCircledIcon,
  },
  {
    value: 'CANCELLED',
    label: 'Canceled',
    icon: CrossCircledIcon,
  },
];