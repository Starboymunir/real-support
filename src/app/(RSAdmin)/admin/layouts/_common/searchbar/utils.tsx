// utils
import { flattenArray } from '@/lib/utils/flatten-array';

// ----------------------------------------------------------------------

type Item = {
  title: string;
  path: string;
  subheader?: string;
  children?: Item[];
  [key: string]: any;
};

type DataList = {
  items: Item[];
  subheader?: string;
};

export function getAllItems({ data }: { data: DataList[] }) {
  const reduceItems = data
    .map((list) => handleLoop(list.items, list.subheader))
    .flat();

  interface Option {
    title: string;
    path: string;
    subheader?: string;
    children?: Option[];
    [key: string]: any;
  }

  interface ItemGroup {
    group: string | undefined;
    title: string;
    path: string;
  }

  // Filter out undefined values before passing to splitPath
  const validReduceItems = (reduceItems as HandleLoopItem[]).filter(Boolean);
  const items: ItemGroup[] = flattenArray(reduceItems).map((option: Option) => {
    const group: string[] | null = splitPath(validReduceItems, option.path);

    return {
      group: group && group.length > 1 ? group[0] : option.subheader,
      title: option.title,
      path: option.path,
    };
  });

  return items;
}

// ----------------------------------------------------------------------

export function applyFilter({ inputData, query }: any) {
  if (query) {
    inputData = inputData.filter(
      (item: { title: string; path: string }) =>
      item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      item.path.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

interface SplitPathItem {
  path: string[];
  currItem: {
    title: string;
    path: string;
    children?: SplitPathItem['currItem'][];
    [key: string]: any;
  };
}

export function splitPath(
  array: SplitPathItem['currItem'][],
  key: string
): string[] | null {
  let stack: SplitPathItem[] = array.map((item) => ({
    path: [item.title],
    currItem: item,
  }));

  while (stack.length) {
    const { path, currItem } = stack.pop() as SplitPathItem;

    if (currItem.path === key) {
      return path;
    }

    if (currItem.children?.length) {
      stack = stack.concat(
        currItem.children.map((item) => ({
          path: path.concat(item.title),
          currItem: item,
        }))
      );
    }
  }
  return null;
}

// ----------------------------------------------------------------------

interface HandleLoopItem {
  title: string;
  path: string;
  subheader?: string;
  children?: HandleLoopItem[];
  [key: string]: any;
}

export function handleLoop(
  array: HandleLoopItem[] | undefined,
  subheader?: string
): HandleLoopItem[] | undefined {
  return array?.map((list) => ({
    subheader,
    ...list,
    ...(list.children && {
      children: handleLoop(list.children, subheader),
    }),
  }));
}

// ----------------------------------------------------------------------

interface GroupedDataItem {
  group: string | undefined;
  title: string;
  path: string;
  [key: string]: any;
}

interface GroupedData {
  [group: string]: GroupedDataItem[];
}

export function groupedData(array: GroupedDataItem[]): GroupedData {
  const group = array.reduce((groups: GroupedData, item: GroupedDataItem) => {
    groups[item.group as string] = groups[item.group as string] || [];

    groups[item.group as string].push(item);

    return groups;
  }, {} as GroupedData);

  return group;
}
