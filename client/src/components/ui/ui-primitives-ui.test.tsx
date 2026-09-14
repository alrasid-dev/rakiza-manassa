// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installBrowserStubs, sweepInteractiveControls } from "@/test/ui-harness";

import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Slider } from "./slider";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./pagination";
import { Progress } from "./progress";
import { Separator } from "./separator";
import { Badge } from "./badge";
import { Avatar, AvatarFallback } from "./avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Spinner } from "./spinner";

vi.mock("@/lib/trpc", () => ({ trpc: {} }));

beforeEach(() => { installBrowserStubs(); });
afterEach(() => { cleanup(); });

/** يركّب مكوّناً ويضغط عناصره التفاعلية (يشمل النوافذ المنبثقة في document.body). */
function audit(name: string, node: React.ReactElement, options?: { maxClicks?: number }) {
  const { unmount } = render(node);
  const report = sweepInteractiveControls(document.body, { passes: 1, ...options });
  const unlabeled = report.unlabeled.map(control => `${control.tag}:${control.element.outerHTML.slice(0, 160)}`);
  console.log(`${name}: عناصر=${report.controls.length} مضغوط=${report.clicked} معطّل=${report.skipped} بلا اسم=${unlabeled.length}`);
  unmount();
  return { report, unlabeled };
}

describe("فحص مكوّنات الواجهة الأساسية", () => {
  it("الأزرار والمدخلات والتحميل", () => {
    const { report, unlabeled } = audit("الأزرار والمدخلات", (
      <div>
        <Button>إرسال</Button>
        <Button variant="outline" aria-label="إضافة عنصر">إضافة</Button>
        <Button disabled>معطّل</Button>
        <Label htmlFor="rakiza-name">الاسم</Label>
        <Input id="rakiza-name" placeholder="اكتب الاسم" />
        <Textarea placeholder="ملاحظات" aria-label="ملاحظات" />
        <Spinner />
      </div>
    ));
    expect(report.errors).toEqual([]);
    expect(unlabeled).toEqual([]);
  });

  it("عناصر الاختيار: مربع، مفتاح، أزرار راديو، منزلق", () => {
    const { report, unlabeled } = audit("عناصر الاختيار", (
      <div>
        <Checkbox aria-label="تأكيد الشرط" />
        <Switch aria-label="تفعيل الإشعارات" />
        <RadioGroup defaultValue="a" aria-label="الخيار">
          <RadioGroupItem value="a" aria-label="الخيار أ" />
          <RadioGroupItem value="b" aria-label="الخيار ب" />
        </RadioGroup>
        <Slider defaultValue={[40]} aria-label="النسبة" />
      </div>
    ));
    expect(report.errors).toEqual([]);
    expect(unlabeled).toEqual([]);
  });

  it("الطيّ والتبويبات والقوائم المنسدلة", () => {
    const { report, unlabeled } = audit("الطيّ والتبويبات", (
      <div>
        <Toggle aria-label="تشغيل">م</Toggle>
        <ToggleGroup type="single" aria-label="المحاذاة">
          <ToggleGroupItem value="right" aria-label="يمين">يمين</ToggleGroupItem>
          <ToggleGroupItem value="left" aria-label="يسار">يسار</ToggleGroupItem>
        </ToggleGroup>
        <Accordion type="single" collapsible>
          <AccordionItem value="one">
            <AccordionTrigger>القسم الأول</AccordionTrigger>
            <AccordionContent>محتوى القسم</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible>
          <CollapsibleTrigger>إظهار التفاصيل</CollapsibleTrigger>
          <CollapsibleContent>التفاصيل</CollapsibleContent>
        </Collapsible>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">الأول</TabsTrigger>
            <TabsTrigger value="two">الثاني</TabsTrigger>
          </TabsList>
          <TabsContent value="one">محتوى الأول</TabsContent>
          <TabsContent value="two">محتوى الثاني</TabsContent>
        </Tabs>
        <Select defaultValue="a">
          <SelectTrigger aria-label="اختر القسم">
            <SelectValue placeholder="اختر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">القسم أ</SelectItem>
            <SelectItem value="b">القسم ب</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ));
    expect(report.errors).toEqual([]);
    expect(unlabeled).toEqual([]);
  });

  it("النوافذ والقوائم المنبثقة تُركَّب وتُسمّى عناصرها", () => {
    // الضغط الفعلي على النوافذ والقوائم يتم في مسح صفحات المنصة حيث تظهر في سياقها الحقيقي.
    const { report, unlabeled } = audit("النوافذ المنبثقة", (
      <div>
        <Dialog>
          <DialogTrigger asChild><Button>فتح نافذة</Button></DialogTrigger>
          <DialogContent>
            <DialogTitle>عنوان النافذة</DialogTitle>
            <DialogDescription>وصف النافذة</DialogDescription>
            <Button>حفظ</Button>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button aria-label="خيارات السجل">خيارات</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>تعديل</DropdownMenuItem>
            <DropdownMenuItem>حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild><Button aria-label="عرض التفاصيل">تفاصيل</Button></PopoverTrigger>
          <PopoverContent>محتوى منبثق</PopoverContent>
        </Popover>
      </div>
    ), { maxClicks: 0 });
    expect(report.errors).toEqual([]);
    expect(unlabeled).toEqual([]);
  });

  it("الترقيم والعرض: صفحة، شريط تقدم، شارات، جدول", () => {
    const { report, unlabeled } = audit("الترقيم والعرض", (
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="/prev" aria-label="السابق" /></PaginationItem>
            <PaginationItem><PaginationLink href="/1" aria-label="الصفحة الأولى">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="/next" aria-label="التالي" /></PaginationItem>
          </PaginationContent>
        </Pagination>
        <Progress value={45} aria-label="نسبة الإنجاز" />
        <Separator />
        <Badge>جديد</Badge>
        <Avatar><AvatarFallback>م</AvatarFallback></Avatar>
        <Card>
          <CardHeader><CardTitle>بطاقة اختبار</CardTitle></CardHeader>
          <CardContent>محتوى البطاقة</CardContent>
        </Card>
        <Table>
          <TableHeader>
            <TableRow><TableHead>البند</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>قيمة</TableCell></TableRow>
          </TableBody>
        </Table>
      </div>
    ));
    expect(report.errors).toEqual([]);
    expect(unlabeled).toEqual([]);
  });
});
