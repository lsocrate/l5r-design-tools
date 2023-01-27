type Result =
  | { error: string; args: undefined }
  | { error: undefined; args: { pack: string } };

export const parseCli = (): Result => {
  const [, , pack] = process.argv;

  if (!pack) {
    return { error: "pack is a required parameter", args: undefined };
  }
  return { error: undefined, args: { pack } };
};
