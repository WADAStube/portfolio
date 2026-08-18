import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}
