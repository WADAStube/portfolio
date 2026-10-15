import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/lib/lang";
import Home from "@/pages/Home";
import Apps from "@/pages/Apps";
import Design from "@/pages/Design";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <LanguageProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/apps" component={Apps} />
        <Route path="/design" component={Design} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </LanguageProvider>
  );
}
