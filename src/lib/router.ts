import { useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "category"; id: string }
  | { name: "dua"; id: string }
  | { name: "search" }
  | { name: "saved" }
  | { name: "tasbeeh" }
  | { name: "mine" }
  | { name: "settings" };

const parse = (hash: string): Route => {
  const path = hash.replace(/^#\/?/, "");
  const [head, param] = path.split("/");
  switch (head) {
    case "c":
      return param ? { name: "category", id: param } : { name: "home" };
    case "d":
      return param ? { name: "dua", id: param } : { name: "home" };
    case "search":
      return { name: "search" };
    case "saved":
      return { name: "saved" };
    case "tasbeeh":
      return { name: "tasbeeh" };
    case "mine":
      return { name: "mine" };
    case "settings":
      return { name: "settings" };
    default:
      return { name: "home" };
  }
};

export const href = (route: Route): string => {
  switch (route.name) {
    case "home":
      return "#/";
    case "category":
      return `#/c/${route.id}`;
    case "dua":
      return `#/d/${route.id}`;
    default:
      return `#/${route.name}`;
  }
};

export const go = (route: Route) => {
  const next = href(route);
  if (window.location.hash === next) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = next;
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
};
