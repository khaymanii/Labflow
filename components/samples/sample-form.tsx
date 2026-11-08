"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAMPLE_TYPES, REQUESTED_TESTS, STATUS_LABELS } from "@/lib/constants";

type DepartmentOption = { id: string; name: string };

type SampleFormProps = {
  departments: DepartmentOption[];
  defaultDepartmentId?: string;
};

type FieldErrors = Record<string, string[] | undefined>;

export function SampleForm({ departments, defaultDepartmentId }: SampleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [patientIdentifier, setPatientIdentifier] = useState("");
  const [patientName, setPatientName] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [testChoice, setTestChoice] = useState("");
  const [customTest, setCustomTest] = useState("");
  const [departmentId, setDepartmentId] = useState(
    defaultDepartmentId ?? departments[0]?.id ?? "",
  );
  const [note, setNote] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const requestedTest =
      testChoice === "Other" ? customTest.trim() : testChoice.trim();

    if (!requestedTest) {
      setFieldErrors({
        requestedTest: ["Select a test or enter a custom test name."],
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIdentifier,
          patientName: patientName || undefined,
          sampleType,
          requestedTest,
          departmentId,
          note: note || undefined,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitError(payload?.error ?? "Could not register the sample.");
        if (payload?.details?.fieldErrors) {
          setFieldErrors(payload.details.fieldErrors);
        }
        return;
      }

      router.push(`/samples/${payload.sample.id}?created=1`);
      router.refresh();
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (name: string) => fieldErrors[name]?.[0];

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Patient reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the hospital or laboratory identifier. Patient name is optional
              for this MVP.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientIdentifier">
                Patient identifier / hospital number
              </Label>
              <Input
                id="patientIdentifier"
                value={patientIdentifier}
                onChange={(event) => setPatientIdentifier(event.target.value)}
                placeholder="e.g. LUTH/2026/00123"
                required
                maxLength={64}
                aria-invalid={Boolean(fieldError("patientIdentifier"))}
              />
              {fieldError("patientIdentifier") ? (
                <p className="text-xs text-destructive">
                  {fieldError("patientIdentifier")}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientName">
                Patient name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Fictional or initials only"
                maxLength={120}
              />
              {fieldError("patientName") ? (
                <p className="text-xs text-destructive">{fieldError("patientName")}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Sample details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Record what was received and which laboratory department owns it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sampleType">Sample type</Label>
              <Select value={sampleType} onValueChange={setSampleType}>
                <SelectTrigger id="sampleType" aria-invalid={Boolean(fieldError("sampleType"))}>
                  <SelectValue placeholder="Select sample type" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("sampleType") ? (
                <p className="text-xs text-destructive">{fieldError("sampleType")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedTest">Requested laboratory test</Label>
              <Select value={testChoice} onValueChange={setTestChoice}>
                <SelectTrigger
                  id="requestedTest"
                  aria-invalid={Boolean(fieldError("requestedTest"))}
                >
                  <SelectValue placeholder="Select requested test" />
                </SelectTrigger>
                <SelectContent>
                  {REQUESTED_TESTS.map((test) => (
                    <SelectItem key={test} value={test}>
                      {test}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {testChoice === "Other" ? (
                <Input
                  value={customTest}
                  onChange={(event) => setCustomTest(event.target.value)}
                  placeholder="Enter the test name"
                  maxLength={120}
                  className="mt-2"
                  required
                />
              ) : null}
              {fieldError("requestedTest") ? (
                <p className="text-xs text-destructive">{fieldError("requestedTest")}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="departmentId">Laboratory department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger
                  id="departmentId"
                  aria-invalid={Boolean(fieldError("departmentId"))}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("departmentId") ? (
                <p className="text-xs text-destructive">{fieldError("departmentId")}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="note">
                Registration note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Sample received in good condition"
                maxLength={500}
              />
              {fieldError("note") ? (
                <p className="text-xs text-destructive">{fieldError("note")}</p>
              ) : null}
            </div>
          </div>
        </section>

        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loading ? "Registering..." : "Register sample"}
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">What happens next</h2>
          <ol className="mt-3 space-y-3">
            {[
              "The sample is registered and gets a unique accession number.",
              "Laboratory staff start processing and record the result as produced.",
              "The result moves to dispatch and is acknowledged on receipt.",
              "Collection is recorded to close the workflow.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm">
          <p className="font-medium">Registration details</p>
          <dl className="mt-2 space-y-2 text-muted-foreground">
            <div className="flex items-center justify-between gap-4">
              <dt>Status</dt>
              <dd className="font-medium text-foreground">
                {STATUS_LABELS.REGISTERED}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Accession number</dt>
              <dd className="text-right font-medium text-foreground">
                Generated on save
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Registered</dt>
              <dd className="text-right font-medium text-foreground">On save</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">Data handling</p>
          Do not enter real clinical results or unnecessary patient data. This
          prototype is for workflow tracking only.
        </div>
      </aside>
    </form>
  );
}
