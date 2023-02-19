export const hasKey = (args: NodeJS.Process["argv"], key: string): boolean => {
	return args.includes(key);
};

export const getKeyValue = (args: NodeJS.Process["argv"], key: string): string | null | undefined => {
	const index = args.indexOf(key);
	if (index === -1) {
		return undefined;
	}
	return args[index + 1];
};

export const getValueByIndex = (args: NodeJS.Process["argv"], index: number): string | null => {
	if (args.length < 2) {
		return null;
	}
	return args[index + 2];
};
