export default {
  parse,
  serialize,
  upgrade,
};

export function parse(str) {
  try {
    const [m_match, major, minor, patch, m_tail, preid, beta] = /(\d+)\.(\d+)\.(\d+)(-([\w\-]+)\.(\d+))?/g.exec(str);
    return {
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
      preid,
      beta: beta === undefined ? undefined : Number(beta),
    };
  } catch (e) {
    console.error(e);
    return {};
  }
}

export function serialize(version = {}) {
  const { major, minor, patch, preid, beta } = version;
  if (major !== 0 && !major
    || minor !== 0 && !minor
    || patch !== 0 && !patch
  ) {
    return new Error('major, minor or patch cannot be undefined!');
  }
  const result =  `${major}.${minor}.${patch}`;
  if (preid && (beta || beta === 0)) {
    return `${result}-${preid}.${beta}`;
  }
  return result;
}

export function upgrade(base, options = {}) {
  const { major, minor, patch, preid, beta } = options;
  const upperVersion = structuredClone(base);
  major && (upperVersion.major += 1);
  minor && (upperVersion.minor += 1);
  patch && (upperVersion.patch += 1);
  if (preid === upperVersion.preid) {
    beta && (upperVersion.beta += 1);
  } else if (preid) {
    upperVersion.preid = preid;
    upperVersion.beta = 0;
  } else if (!preid) {
    upperVersion.preid = undefined;
    upperVersion.beta = undefined;
  }
  return upperVersion;
}
