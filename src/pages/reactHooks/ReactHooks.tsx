import React, {
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";

type HookCategory =
  | "State"
  | "Context"
  | "Ref"
  | "Effect"
  | "Performance"
  | "Other";

type HookInfo = {
  name: string;
  category: HookCategory;
  description: string;
  whenToUse: string;
  example: string;
  color: string;
};

/**
 * ---------------------------------------------------------------------------
 * Hook examples
 * ---------------------------------------------------------------------------
 */

const examples: Record<string, string> = {
  useState: `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <p>Count: {count}</p>

      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,

  useReducer: `import { useReducer } from "react";

type State = {
  count: number;
};

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };

    case "decrement":
      return { count: state.count - 1 };

    case "reset":
      return { count: 0 };

    default:
      return state;
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>

      <button onClick={() => dispatch({ type: "increment" })}>
        +
      </button>

      <button onClick={() => dispatch({ type: "decrement" })}>
        -
      </button>

      <button onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </div>
  );
}`,

  useContext: `import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext);

  return (
    <button className={theme}>
      Current theme: {theme}
    </button>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <Button />
    </ThemeProvider>
  );
}`,

  useRef: `import { useRef } from "react";

export function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Enter text" />

      <button onClick={handleFocus}>
        Focus input
      </button>
    </div>
  );
}`,

  useImperativeHandle: `import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

export type InputHandle = {
  focus: () => void;
  clear: () => void;
};

const CustomInput = forwardRef<InputHandle>(
  function CustomInput(_, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus();
      },

      clear() {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
    }));

    return <input ref={inputRef} />;
  }
);

export function App() {
  const inputRef = useRef<InputHandle>(null);

  return (
    <>
      <CustomInput ref={inputRef} />

      <button onClick={() => inputRef.current?.focus()}>
        Focus
      </button>

      <button onClick={() => inputRef.current?.clear()}>
        Clear
      </button>
    </>
  );
}`,

  useEffect: `import { useEffect, useState } from "react";

export function UserProfile() {
  const [userId, setUserId] = useState(1);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const response = await fetch(
        \`/api/users/\${userId}\`
      );

      const user = await response.json();

      if (!cancelled) {
        setName(user.name);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div>
      <p>User: {name}</p>

      <button onClick={() => setUserId((id) => id + 1)}>
        Next user
      </button>
    </div>
  );
}`,

  useLayoutEffect: `import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function Tooltip() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  return (
    <div>
      <div ref={ref}>
        Tooltip content
      </div>

      <p>Height: {height}px</p>
    </div>
  );
}`,

  useInsertionEffect: `import { useInsertionEffect } from "react";

export function DynamicStyle() {
  useInsertionEffect(() => {
    const style = document.createElement("style");

    style.textContent = \`
      .dynamic-title {
        color: #7c3aed;
        font-weight: 700;
      }
    \`;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <h2 className="dynamic-title">
      Styled using an inserted stylesheet
    </h2>
  );
}

// Usually used by CSS-in-JS libraries rather
// than normal application components.`,

  useMemo: `import { useMemo, useState } from "react";

export function ProductList() {
  const [search, setSearch] = useState("");

  const products = [
    "MacBook",
    "iPhone",
    "iPad",
    "AirPods",
    "Apple Watch",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
      />

      {filteredProducts.map((product) => (
        <p key={product}>{product}</p>
      ))}
    </div>
  );
}`,

  useCallback: `import { memo, useCallback, useState } from "react";

const Button = memo(function Button({
  onClick,
}: {
  onClick: () => void;
}) {
  console.log("Button rendered");

  return <button onClick={onClick}>Increment</button>;
});

export function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((value) => value + 1);
  }, []);

  return (
    <div>
      <p>{count}</p>

      <Button onClick={handleClick} />
    </div>
  );
}`,

  useTransition: `import {
  useState,
  useTransition,
} from "react";

export function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setQuery(value);

    startTransition(() => {
      const nextResults = Array.from(
        { length: 10000 },
        (_, index) => \`\${value} result \${index}\`
      );

      setResults(nextResults);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />

      {isPending && <p>Updating results...</p>}

      {results.slice(0, 10).map((result) => (
        <p key={result}>{result}</p>
      ))}
    </div>
  );
}`,

  useDeferredValue: `import {
  useDeferredValue,
  useState,
} from "react";

function Results({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <p>Searching for: {deferredQuery}</p>

      {/* Expensive rendering can use deferredQuery */}
    </div>
  );
}

export function Search() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Results query={query} />
    </div>
  );
}`,

  useId: `import { useId } from "react";

export function PasswordField() {
  const passwordId = useId();

  return (
    <div>
      <label htmlFor={passwordId}>
        Password
      </label>

      <input
        id={passwordId}
        type="password"
        aria-describedby={\`\${passwordId}-hint\`}
      />

      <small id={\`\${passwordId}-hint\`}>
        Must contain at least 8 characters.
      </small>
    </div>
  );
}`,

  useDebugValue: `import {
  useDebugValue,
  useState,
} from "react";

function useOnlineStatus() {
  const [online] = useState(
    navigator.onLine
  );

  useDebugValue(online ? "Online" : "Offline");

  return online;
}

export function Status() {
  const online = useOnlineStatus();

  return (
    <p>
      Status: {online ? "Online" : "Offline"}
    </p>
  );
}

// useDebugValue helps label custom hooks
// inside React DevTools.`,

  useSyncExternalStore: `import {
  useSyncExternalStore,
} from "react";

function subscribe(
  callback: () => void
) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function NetworkStatus() {
  const online = useSyncExternalStore(
    subscribe,
    getSnapshot
  );

  return (
    <p>
      {online ? "Online" : "Offline"}
    </p>
  );
}`,

  useActionState: `import {
  useActionState,
} from "react";

type State = {
  message: string;
};

async function submitForm(
  previousState: State,
  formData: FormData
): Promise<State> {
  const name = formData.get("name");

  if (!name) {
    return {
      message: "Name is required",
    };
  }

  // Submit data to a server here.

  return {
    message: \`Hello, \${name}!\`,
  };
}

export function Form() {
  const [state, formAction, isPending] =
    useActionState(submitForm, {
      message: "",
    });

  return (
    <form action={formAction}>
      <input name="name" />

      <button disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>

      <p>{state.message}</p>
    </form>
  );
}`,

  useOptimistic: `import {
  useOptimistic,
  useState,
} from "react";

export function LikeButton() {
  const [liked, setLiked] = useState(false);

  const [optimisticLiked, setOptimisticLiked] =
    useOptimistic(liked);

  async function toggleLike() {
    setOptimisticLiked(!liked);

    // Pretend this is a server request.
    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setLiked(!liked);
  }

  return (
    <button onClick={toggleLike}>
      {optimisticLiked ? "❤️ Liked" : "🤍 Like"}
    </button>
  );
}`,

  useEffectEvent: `import {
  useEffect,
  useEffectEvent,
  useState,
} from "react";

export function ChatRoom() {
  const [roomId, setRoomId] = useState("general");
  const [theme, setTheme] = useState("dark");

  const onConnected = useEffectEvent(() => {
    console.log(
      "Connected using theme:",
      theme
    );
  });

  useEffect(() => {
    const connection = createConnection(roomId);

    connection.on("connected", () => {
      onConnected();
    });

    connection.connect();

    return () => {
      connection.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <p>Room: {roomId}</p>
      <p>Theme: {theme}</p>
    </div>
  );
}

// useEffectEvent is useful when an Effect needs
// to read the latest values without making those
// values reactive dependencies of the Effect.

declare function createConnection(
  roomId: string
): {
  connect(): void;
  disconnect(): void;
  on(
    event: string,
    callback: () => void
  ): void;
};`,
};

/**
 * ---------------------------------------------------------------------------
 * Hook metadata
 * ---------------------------------------------------------------------------
 */

const hooks: HookInfo[] = [
  {
    name: "useState",
    category: "State",
    description:
      "Adds state to a functional component. When the state setter is called, React schedules a re-render.",
    whenToUse:
      "Use it for simple local state such as form fields, counters, toggles, selected items, and UI state.",
    example: examples.useState,
    color: "#3b82f6",
  },
  {
    name: "useReducer",
    category: "State",
    description:
      "Manages state using a reducer function. It is useful when state transitions are more complex or related.",
    whenToUse:
      "Use it when a component has multiple related state transitions or when state updates benefit from explicit actions.",
    example: examples.useReducer,
    color: "#2563eb",
  },
  {
    name: "useContext",
    category: "Context",
    description:
      "Reads a value from a React Context without manually passing that value through every component.",
    whenToUse:
      "Use it for values shared across a component tree, such as themes, authentication information, locale, or application configuration.",
    example: examples.useContext,
    color: "#8b5cf6",
  },
  {
    name: "useRef",
    category: "Ref",
    description:
      "Creates a mutable reference whose value persists between renders without causing a re-render when it changes.",
    whenToUse:
      "Use it for DOM references, timers, previous values, or mutable values that don't belong in rendered UI.",
    example: examples.useRef,
    color: "#ec4899",
  },
  {
    name: "useImperativeHandle",
    category: "Ref",
    description:
      "Customizes the value exposed to a parent component when using a ref.",
    whenToUse:
      "Use it sparingly when a parent genuinely needs to invoke an imperative operation on a child component.",
    example: examples.useImperativeHandle,
    color: "#db2777",
  },
  {
    name: "useEffect",
    category: "Effect",
    description:
      "Synchronizes a component with an external system such as a network connection, browser API, subscription, or timer.",
    whenToUse:
      "Use it when your component needs to interact with something outside React's rendering system.",
    example: examples.useEffect,
    color: "#f59e0b",
  },
  {
    name: "useLayoutEffect",
    category: "Effect",
    description:
      "Runs an effect before the browser paints the updated screen, allowing you to measure or synchronously modify layout.",
    whenToUse:
      "Use it for DOM measurements or visual changes that must happen before the browser paints.",
    example: examples.useLayoutEffect,
    color: "#d97706",
  },
  {
    name: "useInsertionEffect",
    category: "Effect",
    description:
      "Runs before layout effects and is primarily intended for libraries that need to insert styles into the DOM.",
    whenToUse:
      "Usually use it only when building a CSS-in-JS library. Application code generally should prefer useEffect or useLayoutEffect.",
    example: examples.useInsertionEffect,
    color: "#b45309",
  },
  {
    name: "useMemo",
    category: "Performance",
    description:
      "Caches the result of a calculation between renders until its dependencies change.",
    whenToUse:
      "Use it when a calculation is expensive and avoiding unnecessary recalculation provides a measurable benefit.",
    example: examples.useMemo,
    color: "#10b981",
  },
  {
    name: "useCallback",
    category: "Performance",
    description:
      "Caches a function definition between renders until its dependencies change.",
    whenToUse:
      "Use it mainly when passing callbacks to memoized child components or when a stable function reference matters.",
    example: examples.useCallback,
    color: "#059669",
  },
  {
    name: "useTransition",
    category: "Performance",
    description:
      "Marks certain state updates as non-urgent so React can keep more urgent interactions responsive.",
    whenToUse:
      "Use it when an update causes expensive rendering and you want input or other urgent interactions to remain responsive.",
    example: examples.useTransition,
    color: "#14b8a6",
  },
  {
    name: "useDeferredValue",
    category: "Performance",
    description:
      "Lets a non-urgent value lag behind an urgent value so expensive UI can update later.",
    whenToUse:
      "Useful when displaying expensive results based on rapidly changing input.",
    example: examples.useDeferredValue,
    color: "#0d9488",
  },
  {
    name: "useId",
    category: "Other",
    description:
      "Generates unique IDs that are useful for accessibility attributes and relationships between elements.",
    whenToUse:
      "Use it when generating IDs for labels, inputs, descriptions, and other accessibility relationships.",
    example: examples.useId,
    color: "#6366f1",
  },
  {
    name: "useDebugValue",
    category: "Other",
    description:
      "Adds a readable label for a custom hook in React DevTools.",
    whenToUse:
      "Use it when creating custom hooks and you want useful information to appear in React DevTools.",
    example: examples.useDebugValue,
    color: "#4f46e5",
  },
  {
    name: "useSyncExternalStore",
    category: "Other",
    description:
      "Subscribes a component to an external store while providing React with a consistent way to read its snapshot.",
    whenToUse:
      "Use it when integrating React with an external state store or browser API that has its own subscription mechanism.",
    example: examples.useSyncExternalStore,
    color: "#7c3aed",
  },
  {
    name: "useActionState",
    category: "Other",
    description:
      "Manages state associated with an Action, including the result of the action and whether it is pending.",
    whenToUse:
      "Useful for forms and asynchronous actions where you need to manage submission state and the resulting value.",
    example: examples.useActionState,
    color: "#9333ea",
  },
  {
    name: "useOptimistic",
    category: "Other",
    description:
      "Lets you show an optimistic UI state while an asynchronous action is in progress.",
    whenToUse:
      "Use it when the UI should immediately reflect an expected result before the server confirms the operation.",
    example: examples.useOptimistic,
    color: "#c026d3",
  },
  {
    name: "useEffectEvent",
    category: "Other",
    description:
      "Creates a non-reactive event function that can read the latest props and state from an Effect.",
    whenToUse:
      "Useful when an Effect needs access to current values without making those values dependencies that cause the Effect to re-synchronize.",
    example: examples.useEffectEvent,
    color: "#e11d48",
  },
];

/**
 * ---------------------------------------------------------------------------
 * Styles
 * ---------------------------------------------------------------------------
 */

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
    color: "#0f172a",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    padding: "48px 24px 80px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },

  hero: {
    textAlign: "center",
    marginBottom: 40,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 16,
  },

  title: {
    fontSize: "clamp(36px, 6vw, 64px)",
    lineHeight: 1.05,
    letterSpacing: "-0.045em",
    margin: "0 0 16px",
    fontWeight: 800,
  },

  subtitle: {
    maxWidth: 720,
    margin: "0 auto",
    color: "#64748b",
    fontSize: 17,
    lineHeight: 1.7,
  },

  toolbar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 28,
    alignItems: "center",
  },

  search: {
    flex: "1 1 280px",
    minWidth: 220,
    height: 48,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "rgba(255,255,255,0.9)",
    padding: "0 16px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },

  filter: {
    height: 48,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#fff",
    padding: "0 14px",
    fontSize: 15,
    color: "#334155",
    cursor: "pointer",
  },

  count: {
    color: "#64748b",
    fontSize: 14,
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(270px, 1fr))",
    gap: 18,
  },

  card: {
    position: "relative",
    textAlign: "left",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    padding: 22,
    minHeight: 220,
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
    transition:
      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
    overflow: "hidden",
  },

  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },

  hookIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
  },

  category: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "5px 9px",
    borderRadius: 999,
  },

  cardTitle: {
    margin: "0 0 10px",
    fontSize: 20,
    letterSpacing: "-0.02em",
  },

  cardDescription: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: 14,
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
  },

  arrow: {
    fontSize: 18,
  },

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    color: "#64748b",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.68)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
  },

  modal: {
    width: "min(1100px, 100%)",
    maxHeight: "calc(100vh - 40px)",
    background: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },

  modalHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  modalTitleGroup: {
    minWidth: 0,
  },

  modalTitle: {
    margin: 0,
    fontSize: 26,
    letterSpacing: "-0.025em",
  },

  modalCategory: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 13,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
    fontSize: 22,
    flexShrink: 0,
  },

  modalBody: {
    overflow: "auto",
    padding: 24,
  },

  explanationGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 0.8fr) minmax(0, 1.2fr)",
    gap: 24,
  },

  infoPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
  },

  sectionTitle: {
    margin: "0 0 10px",
    fontSize: 15,
    fontWeight: 800,
  },

  paragraph: {
    color: "#475569",
    lineHeight: 1.75,
    fontSize: 14,
    margin: "0 0 22px",
  },

  codePanel: {
    borderRadius: 16,
    overflow: "hidden",
    background: "#0f172a",
    border: "1px solid #1e293b",
  },

  codeHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 14px",
    borderBottom: "1px solid #334155",
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: 700,
  },

  copyButton: {
    border: "1px solid #475569",
    background: "#1e293b",
    color: "#e2e8f0",
    borderRadius: 7,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
  },

  code: {
    margin: 0,
    padding: 18,
    overflowX: "auto",
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 1.65,
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },

  modalFooter: {
    padding: "14px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#64748b",
    fontSize: 13,
  },
};

/**
 * ---------------------------------------------------------------------------
 * Main component
 * ---------------------------------------------------------------------------
 */

export default function ReactHooks() {
  const [selectedHook, setSelectedHook] =
    useState<HookInfo | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<HookCategory | "All">("All");

  const filteredHooks = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return hooks.filter((hook) => {
      const matchesCategory =
        category === "All" ||
        hook.category === category;

      const matchesSearch =
        !normalizedSearch ||
        hook.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        hook.description
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(hooks.map((hook) => hook.category))
      ),
    ] as Array<HookCategory | "All">;
  }, []);

  const closeModal = useCallback(() => {
    setSelectedHook(null);
  }, []);

  useEffect(() => {
    if (!selectedHook) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedHook, closeModal]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.badge}>
            ⚛️ React + TypeScript
          </div>

          <h1 style={styles.title}>
            React Hooks
          </h1>

          <p style={styles.subtitle}>
            An interactive reference for React Hooks.
            Select any hook to understand what it does,
            when to use it, and see a TypeScript example.
          </p>
        </header>

        <div style={styles.toolbar}>
          <input
            style={styles.search}
            type="search"
            value={search}
            placeholder="Search hooks..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search React hooks"
          />

          <select
            style={styles.filter}
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as
                  | HookCategory
                  | "All"
              )
            }
            aria-label="Filter hooks by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All categories"
                  : item}
              </option>
            ))}
          </select>

          <span style={styles.count}>
            {filteredHooks.length}{" "}
            {filteredHooks.length === 1
              ? "hook"
              : "hooks"}
          </span>
        </div>

        {filteredHooks.length > 0 ? (
          <main style={styles.grid}>
            {filteredHooks.map((hook) => (
              <HookCard
                key={hook.name}
                hook={hook}
                onClick={() => setSelectedHook(hook)}
              />
            ))}
          </main>
        ) : (
          <div style={styles.empty}>
            <div
              style={{
                fontSize: 42,
                marginBottom: 12,
              }}
            >
              🔎
            </div>

            <h3>No hooks found</h3>

            <p>
              Try a different search term or category.
            </p>
          </div>
        )}
      </div>

      {selectedHook && (
        <HookModal
          hook={selectedHook}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/**
 * ---------------------------------------------------------------------------
 * Hook Card
 * ---------------------------------------------------------------------------
 */

type HookCardProps = {
  hook: HookInfo;
  onClick: () => void;
};

function HookCard({
  hook,
  onClick,
}: HookCardProps) {
  return (
    <button
      type="button"
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-4px)";
        event.currentTarget.style.boxShadow =
          "0 18px 40px rgba(15, 23, 42, 0.12)";
        event.currentTarget.style.borderColor =
          `${hook.color}66`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";
        event.currentTarget.style.boxShadow =
          "0 8px 30px rgba(15, 23, 42, 0.06)";
        event.currentTarget.style.borderColor =
          "#e2e8f0";
      }}
    >
      <div
        style={{
          ...styles.cardAccent,
          background: hook.color,
        }}
      />

      <div style={styles.cardTop}>
        <div
          style={{
            ...styles.hookIcon,
            background: hook.color,
          }}
        >
          ⚛
        </div>

        <span style={styles.category}>
          {hook.category}
        </span>
      </div>

      <h2 style={styles.cardTitle}>
        {hook.name}
      </h2>

      <p style={styles.cardDescription}>
        {hook.description}
      </p>

      <div style={styles.cardFooter}>
        <span>View example</span>
        <span style={styles.arrow}>→</span>
      </div>
    </button>
  );
}

/**
 * ---------------------------------------------------------------------------
 * Hook Modal
 * ---------------------------------------------------------------------------
 */

type HookModalProps = {
  hook: HookInfo;
  onClose: () => void;
};

function HookModal({
  hook,
  onClose,
}: HookModalProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        hook.example
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }, [hook.example]);

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={styles.overlay}
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <section
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hook-modal-title"
      >
        <header style={styles.modalHeader}>
          <div style={styles.modalTitleGroup}>
            <h2
              id="hook-modal-title"
              style={styles.modalTitle}
            >
              {hook.name}
            </h2>

            <div style={styles.modalCategory}>
              {hook.category} Hook
            </div>
          </div>

          <button
            type="button"
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div style={styles.modalBody}>
          <div style={styles.explanationGrid}>
            <div>
              <div style={styles.infoPanel}>
                <h3 style={styles.sectionTitle}>
                  What is it?
                </h3>

                <p style={styles.paragraph}>
                  {hook.description}
                </p>

                <h3 style={styles.sectionTitle}>
                  When should you use it?
                </h3>

                <p
                  style={{
                    ...styles.paragraph,
                    marginBottom: 0,
                  }}
                >
                  {hook.whenToUse}
                </p>
              </div>

              <div
                style={{
                  ...styles.infoPanel,
                  marginTop: 16,
                }}
              >
                <h3 style={styles.sectionTitle}>
                  Remember
                </h3>

                <p
                  style={{
                    ...styles.paragraph,
                    marginBottom: 0,
                  }}
                >
                  Hooks can only be called at the top
                  level of React components or custom
                  hooks. Avoid calling hooks inside
                  loops, conditions, or nested functions.
                </p>
              </div>
            </div>

            <div style={styles.codePanel}>
              <div style={styles.codeHeader}>
                <span>
                  TypeScript / React
                </span>

                <button
                  type="button"
                  style={styles.copyButton}
                  onClick={copyCode}
                >
                  {copied ? "✓ Copied" : "Copy code"}
                </button>
              </div>

              <pre style={styles.code}>
                <code>{hook.example}</code>
              </pre>
            </div>
          </div>
        </div>

        <footer style={styles.modalFooter}>
          <span>
            React Hook reference
          </span>

          <span>
            Press <strong>Esc</strong> to close
          </span>
        </footer>
      </section>
    </div>
  );
}
