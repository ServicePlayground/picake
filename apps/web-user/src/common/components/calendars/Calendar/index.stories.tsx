import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Calendar } from ".";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    selectedDate: {
      control: { type: "date" },
      description: "선택된 날짜",
    },
    onDateSelect: {
      action: "date-selected",
      description: "날짜 선택 핸들러",
    },
    minDate: {
      control: { type: "date" },
      description: "최소 선택 가능한 날짜",
    },
    maxDate: {
      control: { type: "date" },
      description: "최대 선택 가능한 날짜",
    },
    className: {
      control: { type: "text" },
      description: "커스텀 클래스명",
    },
    initialMonth: {
      control: { type: "date" },
      description: "초기 표시 월",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// 기본 사용 예제 (상태 관리 포함)
export const Default: Story = {
  render: (args) => {
    // 스토리북의 date 컨트롤은 타임스탬프(숫자)를 반환하므로 Date 객체로 변환
    const convertToDate = (date: Date | number | string | undefined): Date | undefined => {
      if (!date) return undefined;
      if (date instanceof Date) return date;
      if (typeof date === "number") return new Date(date);
      if (typeof date === "string") return new Date(date);
      return undefined;
    };

    const selectedDate = args.selectedDate ? convertToDate(args.selectedDate) || null : null;

    return (
      <Calendar
        {...args}
        selectedDate={selectedDate}
        minDate={convertToDate(args.minDate)}
        maxDate={convertToDate(args.maxDate)}
        initialMonth={convertToDate(args.initialMonth) || new Date()}
      />
    );
  },
};

// 실제 로직 검증: 활성화된 날짜를 클릭하면 onDateSelect가 그 날짜로 호출된다.
// 픽업일 선택 등 실서비스 플로우에서 가장 핵심적인 상호작용이라 인터랙션 테스트로 고정.
export const ClickSelectsDate: Story = {
  args: {
    onDateSelect: fn(),
    initialMonth: new Date(2026, 0, 1), // 2026년 1월 (월 고정 — 날짜 중복 없이 안정적으로 조회)
    selectedDate: new Date(2026, 0, 1), // 이미 선택된 날짜가 있어 마운트 시 자동선택 이펙트가 개입하지 않게 함
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "20" }));

    expect(args.onDateSelect).toHaveBeenCalledWith(new Date(2026, 0, 20));
  },
};

// 실제 로직 검증: minDate 이전 날짜는 비활성화되어 클릭해도 선택되지 않는다.
export const DatesBeforeMinDateAreDisabled: Story = {
  args: {
    onDateSelect: fn(),
    initialMonth: new Date(2026, 0, 1),
    selectedDate: new Date(2026, 0, 10),
    minDate: new Date(2026, 0, 10),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const beforeMinDate = canvas.getByRole("button", { name: "5" });
    expect(beforeMinDate).toBeDisabled();

    await userEvent.click(beforeMinDate, { pointerEventsCheck: 0 });

    expect(args.onDateSelect).not.toHaveBeenCalledWith(new Date(2026, 0, 5));
  },
};
