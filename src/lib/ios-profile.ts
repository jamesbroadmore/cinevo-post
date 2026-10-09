/** Builds an unsigned iOS configuration profile that adds the CINEVO player to the Home Screen. */

import { readFileSync } from "node:fs";

const ICON =
  "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAZfElEQVR42u2deYxc13Xmv3PvW+rVXr2wu0mKNEVSpGVKFGWHtiwajiRPpFjJeIBgltgeeIwJ4EEwwCBIBvPHLH8MMBNM4rFlQ5NJzGQmySQRIsiiJNKSHDnxGtuSI8mmaIn7TnHpZi/Vtb737jnzR1UvbHY3qxeKrKr7oUCgVz7U/fV3vnPvffeR67pYZREBApn+WJHrq6yrMp7KupT2VApQrkrBavUUcRngkMuRlEIuRjxZ5yJLNDMqIAEwa1xWZ7BXESACzeKGEroQ6L5A9Xs661BSkQYIEBEGIGA76qs5kFAAiFTjTWYxsVRCU6zycNWM1MzYNDrXDtPtAdDsa0qoQtpdn1SDvpNXcAQsYgQMMEDNb7e6WZKpfxVBEWmCYsT1eLzCl0rR+RqPrS5GKweIpi6a0s66nLspqdcochlGxDBEWWJuKU8MKBCRVtAsUcVcmYhOleIL06O2wqK2EoBoCnbKOOsL3l2B7hMISzTFjbIDeNuIGyQpcglUNSNj4dHJ+Hxj+LCCbLRMgKYNMKUHe/0dCd0DsJGYrN/c9p4kgCYHUDUzerV+qGwuraSiLQegxn/mUqrX35F1NwAwEhHEWk4bGZKANLkAitHZq/VDkZSXx9BSAWqWzJy7qc/b4ahkLDWy1aqNMYJDiZgrI+GhiejUMlKR1lq3bjyAKHIGEh/s83cAiBErKFuz2rf3J5BBrMnJuBtclayYKwKmpQxoqwA1/M1T2bXBnrQzFEmdLDidAREAiEGc1H1JPVg1I0bqrTPUEkANepJ6cCj4qKdTkdSVrVmdhhHFiDyVSjvrQy5GUmqRoRsD1KAnpYfWBg8o0twsW1YdyBDDaHIy7vq6mQhlshWGbgDQlPcMrQ0eEAhgyNLT0QwBBqCMu6FmxqMWGFoMoFne8xEBALbdVneEIgYo25oPLQjQlPcMrE0+IGDAWHq6iSEDIOPdUTNji+ehhZho9FyZwcRuSGPl3NLTVVIChmAwsdtTGZlZ8WgVIChyhhK7tfIYsc09XelCihFr5Q0ldityllDCGhOGaxL3pZx1se3YuztTG8SeymjyyvHFeQvZXIAa0Sfrbujz74mkaumxDBlESb0mklKdJ65naA5ABIhDwaD/ESEmgZ1ttiKAYQLVX4rPM6I5SKg53wqg19/hqIBFLD1WDS5YxFFBr7/jekdRczqvQK3JOHcYqSlLj9UMJWSklnHuCNSaOR3ZHAdSvd7dq75x36pTJL3e3XNa8mYGanReKT1U8LcaCW3fbjVPIUPs6Uz92iWOJigCIVDe2yJgW7qsFkrTAs57W2bvXVRT9oNADyR1H0tkJ52tFspCLFFS9wV6YBob1TQgIOduEoi1H6sbmZDk3E3T2CiABPBU1tqPVesm5KmsAAA5jS3UaWedIjeSusXHanExxCUv7awbDYsEOI34HKgBI4ZsB2/VQhUzYgI1QDgsjTtIPZX1dVZg7NSzVSsICYyvs57KNkN0QvUqcti6j1XLVUyRk1C9ABwAge4FmOyuMatWqxgDHOjeifikUqQ9lRUYsvXLqlWASGA8lVWklUtZrXwWtgHIqnWEWFgr36WsclVKkQN7XpjVEoOQIsdVKeWpzMpPGbLqPglAnso4jkrNOhfNymoJDDkq5bgImFls/2W1NCkWdhEogrZvhtVy2zGtHJW0J+5aLSsEsaOSjo0+ViuqZPYtsLIAWVmArCxAVl0oG6KtrANZ3UIHaiP/Wd3nFFl1nQNFUieQvWvWZqAlSwBNtMbddLl+ggieSoqwdaPbQboncVdblC+F2n/e+nnXeexqeHI8uqDI0cq1DFmAWiy0VGf6nU3ZtcHjKfdTOSczEp4uxcNaeZoci5EF6IbxGbHgX67bvD1VenNy66bkji3phxSpkfBU1Uy45BOUnY+wAC0GEEP+6eD2jRkTxd7hSl/WSW5Of2hTck/IleHwZCRVh3yyWytvBUBb2wIgA/nM0NY1fnbIvXy8urlkHMOccvLb03vWBvdWzNjV8KTAOMoDxGJkHWh+gAb8jEOVrA5/XtnoERkgEunxBt+f/kTB2zgeXRwLz07laysL0GyARD69duuaIBUb1Z8YGQn7L4ZZjwAoI2wgQ4lN2zKPppyekfB0Mb7skKfILtTcfIAKflu08U2ABhIpYSbCoDf2VmkLg2jqFQkrOBuD929NPexSYjg8WYnHXEoA2rZpN9OB/K3t40B3DSRSYAPopFOEeMeqAz6JgDB1YFbIxtfJLeldm1J7jETD9WORVFxKALBuZAG6a9qBIHooMXy8sqlkfD3rlloixZCQOeXktmU+uj7YVTHjV8ITAuMo3463BSglzIpIoBxVz+vaofJGd8qEpr6ZGhhFwgVvYHv6kTX+lvHo3dHwjCJt87UFiImIABGnx786Eq65GGa9axlqYgRlhBky6G/cnnk06w4Ohycn4yuaXDt/vVpq75VtEfWLhdcTypgFyVMEVTUMOPfnfuXX1//Bgz3/WsGpmgmA7D1xq+JAW9qojR9IpBsOhOYN/c71aXqeH6dmvvZ0cGfyvs3pjwvkcv1IJBU7f91tJWwGoGZjdU2aXuwBMc1gxJxyclvTH9kQ/EKVi8P1YzZfdy9ABABKz6RpyKKnHM3ka5a81789/dCgv308enc0OqOgbL5eDkCFdgAIgBH5zDwOhNlp+t350vQCGFFj/nqNf8f2zGN5d/2V8PhkfFmRo2y+7p4QPTtNP1T4h5SOzRJcTRFUlVmgd+Ye/cz6P9rT+wVNXtVMNL5q4WjRgdomRM/rQNNpOnCKGs6RyqDfggnNdiMAERtHJe5M3rs1/RCBLtXesfm6iwACQBARZ8gfPlXdMGESDi3tcYtECpCQOamzW1K735d8oMbFK418TTZfdwFAje9SKupxKm+VN2nC0s8MncnXOa93W/qhtcG9Y+H50egMQI7yrBF1OEAEiLh57+p41HO+nveWUsjmzdd93tq7s48V3A3D9ROT8WUFRyubr+cBaHP7ALRtUQdqasgfPVTebKAIWN7ZxY39IbEwoNYmNt+d+WVfpa7Uj1bMqEOegrZHcrWpA90AoEaaTjiTU2kasoLDr6fyNWvy3pe8d1v6HwHqcv1wyCWH/EZssgB1FEBTaVo30nTRJDSt9OHljXXbiNnXqS2pX9ic+ljVTF6JjhuOHOXZm0E6DSAAgFpZml44X4tknMK27C/eoXeN4cJ46ZyKRPleVwOU97a0xYUakc+sawkgAlicwsrS9ILBSAlqkusdwu9/Un1oY/XIydq7l0grclxh6U4Hap8Qva5FB2q6zpA3+lZ5i4FarefIiIJTpzhLB/8TF+9Cfsud/f/kkzqTqRw5EY6MKN8jrSFsAWp7gAgQ6IRT8ogOV9auigmJggoRZ/D2f0F5K7mTZEIm7RYevKf30UfBpvzOUTM5qRMJIoKIBaitHai5yDqYuHKmdsdYHLgrZIhADGVw5D9g4h64ExAHpAgipspOOtn7Sx/OfvgjpliqHDkmUagSCQtQewPU+Dml4j6ndLB0p1pBmhYFYlCMo/8eox+GW4Q4s+O1AoupcGJdX9/jD6Xvvrt+abhy4iQRKd/r+B5NF/w72weg7UsCiAAWN+eNTsa5s/XC8gqZKJCBinH0dzD8MbhFiJ63S1McMtcl9f47+h5/LNiwrnLiTP3dC8pxydGQjr3bur0caPsSHaj500Pe1Z+XN0eil+xDjcoV40iDnon56JlFESniKkNU9oNbex971Mnly28fiUZHp/K1WIDaDCACBMp3ylNpeilz0wQYkJnynkXpmVU1CQRTMdr383vu6XnkYQKVDr1jKhWd8DsvX3e+A02l6eFGmm51pwcBvGR6ZocvsJgyO4VMzyMfzu/5aDxeLB8+JrFRfkftD9H5dgAIgBH57DJLWDNN9zqlt0p3tjQ33TCuEEd/G8MfXzI91+RrI1wVf21f3ycfTn3gA7XTZ6tnz4PQyNfSEQC1TYj+7JK7sGWlaYIQ3Emc/jwuPg53fFn0XIMRccgcSmrbHf2fetwfHKgcP1m7eEm043qOMFuA3jOAlu1A16ZpaIUFfGiKnlOfx7l/tkDPtSyKiIhrDKjch7b1Pv7JdNKLjp24OjLq+77WWto2GHULQC2laYIAbgmnP4dz/wJuEbKqO+tJEQCuGuP6dz96/7/97CP1cnjq0InKZMlPJkhRO2LURQ50gzQ9Rc+pm0PP7DhmWII6f+x9mY/92oP3fnz3xMjY6UMn4zDyA7/tYpHO+5u6poQ1h2/AnThY2nzNnBABDXr+1c2lZ3pyIOepe5JSKcvQpv5HPv2JTTu2XT578dyxU5q067vSnHhsXJ5YB7pdACKA2cl4YzWTOVXr9VUzTYuCU8aZz910eqYAQtbBfVmCoijksCZb7t/48K8/vmbdwImDx4YvXfJcz3HbI1933e1zRCziPpj/acGpxQyCiIY3jnP/HGc/fdPpmWcAlFJalcY4jvCp3/zHX/n+n3zuP/4b7TrFsQkiUvp2H6DucqDpNO3pakD8dmW954g7jkuP4fRvwClPbRvDzEsJE2SRlwLf6CVzXiKcc2RnVsmsfE1E1bIJMsHux3Y98CsPR7Xo6Otv1ypV9/be8dh1AE2lab3GHz4frR29mr78GB3+dyQhMYgVMc28DFFdqUirSM3/CpWqKVVf9BVe92FZqaSnPpSem26UUmykVubCQO6BX92z+5f3lMYr54+dUXT7+pDTLq3jal8nkeJP+Af3PrKr+IXaUFGRQK7DUolZE55TYjAPsiIgl+tr6ycXwFQMUT662hNewOwDh4k4rjv5zTz0W5C56yqNw9fCGpJZbNi6bnB9rwgEctsOk4OuFJFBPT2w8fXffvg39U9j4vketkEgEcdMLNoHCSRc0OlEQDR3xpIUoknmPa/ht+ZQyYZJqXSvroxW9v2Pp5766nNXL11MpXO38x95lwIEIagYO58PohHESSie51ZBAQBRKVksTkFuXF/k2v9ZkfgVJ3fNJ5kFlMwrqZlv7X3+r778zOl3jiYS6Uyuh425nd/IrgSIGLUM7v4bDB6WegaKscBhiQQQmBaNU0vdRS8QkliJmUaHBYmM8oA3X/z2n/73pw796E3tBtl8Lxtzm9ODtnpq8ypdJwmMh8IF7HgJUYKIb9k7IGJi9pI6SODkq2/8xX/7Pz948TUDN5UriLCJo7aYSOxCBxIYBzv3IVFEmALxLflTMEbIoVxWDx858Wdf/OP9f/mdShWpbI4gbOJV/puxAK1m8QpTeN+r2PDTW0WPYXIg2azm4shT/3Xv1/d+c3i0mkpnMjkYY9puNbWrABKwg0QRO/eDb0HtZgYIThBJ6D994OrvfeE3zp46n0hmc7msMea2TzsWIBKEPu5/BtlLqGdA792IiYCFdMKA8L2fpX93X/+rR93AHcvmC9y+7LRhiF7BURvEiAIMvYMtP0A99Z7R00THY+3yWycT//P5vm+8nlYKhQyz6DiOqc3/Kp32wmcFP6+gI+x69j2OO9oRnYjPXfS/tL/36R9maxFlAwYh5mZGbvdt0d1RwsignsE9B9B3CvX0e5CdDUMr6LSZGNd79/f/4SuFq5M6m+ScK4Y76h7DLgCIBFECvWew42WEyZtNTyMp6xTHNfXXf5v/0gu9J654mcD0pE3MZDru6I4ucSDgvuegQ0TBzQOIG+sagYHgW6+nf++53lePB6mE9GZiwxQzdeRb2+kz0Y3iteX7WHfw5hUvETCTTjA0v3Es+PL+nm+8kXa19GViIxQbdPA5eB3tQI1Vi8wV7HwBUQIkNwNqNqQ91j6fPO89caDn6R9mI0P5FIugU12ne0qYIPZw7wGkRm+G/RgmrURn46tX3b3P5b/2SmGsonJJTpKYrjmmrHMBIkaYxB0/xaYfrzo9zCCCTpuwrJ76ZuGJAz0nr3i5pCmkjGEy3XRWYudmINbwKtj5AmQ1j+JlAQQqyYjpGz/OfHl/4bXjQSbgvmxsDAyj2479ddrlZsilXScZhBl88Gn0nEUtA2VW5QKYSQcMJT96J/n7z/V8+62k60pfNjZMUYzuVCeWMGLEAdYcx13fRZhcOT0zSTlhjp5OfOVA4ekfZVgon2YRxIbQxepEgIQAxn374EQIVzrxY5i0Fp2Lhy97f/T13N5v5ScqKp9i6qak3E0AEaOexvtfweDhFS65G4Yi6LQpF/VfHuh58sX8qWE3n+JC2hgm+5yMtgvRLfy9NyZ+spfxgZcRJZbtPY05ZZ0yCGnf9zNffKHn4Fk/k+D+bGwMdWFS7h4HEhgHu76OYGJ5Gw6nkrKBwvcOJr/0Qs+3DwWBL/3Z2DB1edzpdIAaEz8b/wEb3lwGPU10fNa++fnxxFdfLHz9xxmB9GRsUu4KgASs4Zdw3/MwS67LxpB2RGfi8xe8r72S/9PvZIsVlU8zATYpd0wGkhuknzCBXfuQvYx6uvXs3EzK2Xhy3Pm/3+z5g5fzF8acQqqx+8Li0SUO1Nyuehhbv4t6skV6mCGATrGE9NTf5b76jfxb57xcwP3ZODZk6WkVoE7wH1HQIe57tsUd0yJggQ4ESr71RuqJA/nvvh0kfenPGsMU2bjTXQ6kDGoZ7HgJ/SdvuGgqAsPk+Kw9eeNI4n+9lH/uJykB+jKGxTZZXQjQzHbVlxAmF9/xYwxpV5xMfOac/+TLuf/3vWw1pHyKCV2xcceG6AXuyxDCzufhVhfZ72wYSkFnzcSY/tqBnr2v5C6O60KaE65tsrrZgRqrFlu+j/U/W6h4NY6pbCTlP/+b7JMv5X5+wc8nTV/WxKa7Nu5YgK4rXuwiPYJ7DyD2rzcnFohABwyFl3+SeuJA/u+PJJK+rLFzyhagZkWLPOx+AemROfYzPacMX147FHz1pdxLb6YA9GWZ2c4pW4AwvV31Z9j06hx6jCHtss6Yk2f8r7yY++u/z9QiyqUMwaJjQ3STHkA03Bp2Pg+h6c83bwbNmvFR/eS+wp99J3OpkZQ9MdwGJzW1K0DttKVVprNzCvc/g56zDftp3gyaZq7Rn7yY+9/fzB656OUD05sxHXxHny1hyy1eUQL9J7Dt2wiTDBaGDgSCfT9IP/lS7rXjfuBJfyY2xiZlC9A8RkSAYNezomOuJXRg4MkPDwZf2p9/5WDgaOlN2zllm4EWykCKESZl68um/4g2KZ2Pjp/2v/hCbt+rqVpM+ZQRmTk2xco60JziJYg9k7msdu6nwB0bxhPP9P75dzPDk6qQaiRlO5oWoMUJMo5+8NmaW9777NAf/23y+BU3F3BfmmOGnVO2AN3IfsKEt+Un+08f+d1nNv/srJv2pT/DxsBu3LnFI7Mu+UA7xB/RUHcOxG+dcwBkAjZMYl3HhuhWMQcYfOi8TvkMoLNP3LEl7GYp6QlbbG43gNpoRGxSvg2l7Ftg1fkZyMo6kJUFyMrKAmRlAbKyIdqqYxzISJ1gd89YLVkEMlJXdi3SatliwGGuiUoKIpuHrJYIj8tccwzqAFb+QDerLpMAMKgrI1WAYWOQ1VIjENhIVRnUxQJktXSABGxQV7FUWSILkNVSAWKJYqkqAcdSVaRaOojZygoAWJGKpSpgB0CIYgIFm6OtlpSgQxTRaN1jqYgYW8WslhCAxMRSaQJkpBpJlaDtG2PVWgOmI6kaqQJwABJIKEVXpUViO51odcMAROSEXBQIQM1N9aGMJWWgcXSKfYesbli/QhlrfNB8HGQstboUCbYXs7qR/UDVpRhLrZGmVbOoATUeIbI52upG/kNU45FpbNR0VxbLZN2UyO4Qslq4eyc4dVOKZXIaGzVT2CA1uQKyMchqQYBAVJMrjfjc+JQz8zUgkmLEZZcCgZ0WsrrefnTE5UiK08BgTtMukAq/a3sxq/ntB1Thd+VaNubM+lAkpRqPKnJtO2Y1u/lS5NZ4NJLSnNKkrqMMFb5oJIKdmLaakTYSVfji7OLV/ILWc0AhgWGJPSrYJGTVsB+CU+bzMcrX83A9QADIoKqhXZURxJahri9eXp2Hq3Jl3nCsFopLZVyMpExwbBjqcu+JpFzGxYVaqwWXTkW4ZM4yDEHbpqxr+3aGKZmzIguaiFqkZzOol8wZgGwV60oRQCVzxqC+yMzOvBlo5lcwQoOKT3lrQt2HD03y6QilxecFFweoEajrsVQTKjftTPbN7ezKBRABRXM2wuQNZ5VvCFDDh+oxagkqUPPXWYY6OPcogirymVboaRGgaYaqLmUUHNj5oc7tuRhmks9GMtniilaLADUZiqSkVUrDt3OMnUePghuhVjJnYlRaXw9tHSA0nncSyjhBu5QSiLWizkAHUAq6xqNlPsuIlrSaviSAmmUywiQjciip4drbots99Ci4jLjCF6tyZRm99jIAarRm1VCKBO1QkhpPIrAYtV9e1gRV5/GF1rlaQsF13WVOE0AAuEgHasBVSRGxwaid0CGKuFLlyxFKswf0PQPoGnmUS1Cvo5IQCIxt9W9PbgAiaBBirtTkaigTK/+lKwdohlyPsh7lPUoTKRER8FRpszDdQmgEUARFRCIcSimU8bC5LRUr3326Og40+zocClxkXJV2kCDSIgLw1D5I60zvkdMAIBCa3JgYtYhLESZjqa4WOqsL0DzX5FCgKXCR0vAVuTSzcCsAxC6uraqmjtqlqbeYWSKDeoSykeosbrC6e95XF6D5L5GgNfkaniZfwVXkAaTh2VFfRRmEgLCEjMhI3SA0UheYm8TNtP4/BbEbVosP0LkAAAAASUVORK5CYII=";

const PROFILE_UUID = "8C1E0A11-7B2E-4C3A-9F10-C1AEE0100001";
const CLIP_UUID = "8C1E0A11-7B2E-4C3A-9F10-C1AEE0100002";

function clipIcon() {
  try {
    return readFileSync("public/pwa/icon-180.png").toString("base64");
  } catch {
    return ICON;
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;");
}

/** The house URL an iPhone should open, or null when the page address is not http(s). */
export function profileHouseUrl(pageUrl: string, forwardedHost?: string | null, forwardedProto?: string | null): string | null {
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const forwarded = String(forwardedHost || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const proto = String(forwardedProto || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (forwarded && /^[a-z0-9.-]+(?::\d{1,5})?$/.test(forwarded) && !forwarded.startsWith(".")) {
    const scheme = proto === "http" || proto === "https" ? proto : url.protocol.replace(":", "");
    return `${scheme}://${forwarded}/app`;
  }
  return `${url.protocol}//${url.host}/app`;
}

export function iosLoopback(houseUrl: string) {
  try {
    const host = new URL(houseUrl).hostname.replace(/^\[|\]$/g, "");
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return true;
  }
}

/** Unsigned profile. iOS installs it from Settings after the download. */
export function renderIosProfile(houseUrl: string) {
  const url = escapeXml(houseUrl);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>CINEVO</string>
  <key>PayloadDescription</key>
  <string>Installs CINEVO on the Home Screen. Created by CDXI. Distributed as a Fourtee2 Digital project. Full screen. No App Store.</string>
  <key>PayloadIdentifier</key>
  <string>me.cinevo.profile.player</string>
  <key>PayloadOrganization</key>
  <string>CDXI</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${PROFILE_UUID}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>CINEVO</string>
      <key>PayloadDisplayName</key>
      <string>CINEVO</string>
      <key>PayloadIdentifier</key>
      <string>me.cinevo.webclip.player</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>${CLIP_UUID}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${url}</string>
      <key>Icon</key>
      <data>${clipIcon()}</data>
    </dict>
  </array>
</dict>
</plist>
`;
}
