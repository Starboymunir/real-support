const findContentByType = async (type) => {
  const res = await prisma.StaticContent.findUnique({
    where: {
      contentType: type,
    },
  });

  return res;
};
