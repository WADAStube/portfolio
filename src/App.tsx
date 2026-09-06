import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/lib/lang";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <LanguageProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </LanguageProvider>
  );
}
