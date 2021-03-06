/**
 * 时间模块
 * @see https://www.yuque.com/fengyong/game-develop-road/ox9e872
 */

import { log, LogLevel } from "./log";
import { get_positive_mode, is_number, is_string } from "./tool";

/**
 * 数据输入
 * @example
  // 如果为number，则表示毫秒数
  88888
  // 如果为string，则表示带单位的描述
  "99ms"; // 99毫秒
  "99s";  // 99秒
  "99m";  // 99分钟
  "99h";  // 99小时
  "99.5d";// 99.5天
 */
type TimeInput = string | number;

/**
 * 检查输入参数的合理性
 * @param input
 */
function check_time_input(input: TimeInput): boolean {
  let REG = /^[0-9]+\.?[0-9]*(ms|s|m|h|d)$/g;
  return (is_string(input) && REG.test(input)) || is_number(input);
}

/**
 * 数据组
 * - 带 _fix 后缀的表示经过模处理之后的数值
 */
interface TimeGroup {
  ms: number;
  ms_fix: number;
  s: number;
  s_fix: number;
  m: number;
  m_fix: number;
  h: number;
  h_fix: number;
}

/** 微秒的模 */
const MS_MODE = 1000;
/** 秒的模 */
const S_MODE = 60;
/** 分钟的模 */
const M_MODE = 60;
/** 小时的模 */
const H_MODE = 24;

/** 1s = 1000ms */
export const S_MS = MS_MODE;
/** 1min = 60000ms */
export const M_MS = S_MODE * S_MS;
/** 1hour = 3600000ms */
export const H_MS = M_MODE * M_MS;
/** 1day = 86400000ms */
export const D_MS = H_MODE * H_MS;

/**
 * 转为毫秒数
 * @since 1.0.0
 * @param source
 * @example
 */
export function to_ms(source: TimeInput): number {
  if (!check_time_input(source)) {
    log(LogLevel.Error, `转义错误，func="to_ms"，source=${source}`);
    return;
  }
  if (is_string(source)) {
    let count = Number.parseFloat(source);
    if (/ms$/.test(source)) {
      return count;
    }
    if (/s$/.test(source)) {
      return count * S_MS;
    }
    if (/m$/.test(source)) {
      return count * M_MS;
    }
    if (/h$/.test(source)) {
      return count * H_MS;
    }
    if (/d$/.test(source)) {
      return count * D_MS;
    }
  } else {
    return source;
  }
}

/**
 * 转为数据组
 * @since 1.0.0
 * @param source
 */
export function to_time_group(source: TimeInput): TimeGroup {
  let ms = to_ms(source);
  let ms_fix = get_positive_mode(ms, MS_MODE);
  let s = Math.floor(ms / S_MS);
  let s_fix = get_positive_mode(s, S_MODE);
  let m = Math.floor(ms / M_MS);
  let m_fix = get_positive_mode(m, M_MODE);
  let h = Math.floor(ms / H_MS);
  let h_fix = get_positive_mode(h, H_MODE);
  return { ms, ms_fix, s, s_fix, m, m_fix, h, h_fix };
}

/**
 * 转为格式化时间串
 * @since 1.0.0
 * @param ms 微秒数
 * @param zero 是否显示为0的值
 * @example
  to_time_format(888888888); //-> 246:54:48
  to_time_format(8888888); //-> 02:28:08
  to_time_format(88888); //-> 00:01:28
  to_time_format(88888, false); //-> 01:28
 */
export function to_time_format(source: TimeInput, zero = true): string {
  let group = to_time_group(source);
  let r = [group.h, group.m_fix, group.s_fix];
  // 过滤
  if (!zero) {
    while (r[0] === 0 && r.length > 1) {
      r.shift();
    }
  }
  return r.length === 1 ? r.join("") : r.map(v => v.toString().padStart(2, "0")).join(":");
}

/**
 * 转为普通时间串
 * @since 1.0.0
 * @param source
 * @example
  to_time_string(1589974698751); //-> "19:38:18 GMT+0800 (中国标准时间)"
 */
export function to_time_string(source: TimeInput): string {
  return new Date(to_ms(source)).toTimeString();
}

/**
 * 获取给定时间的天序号
 * @since 1.0.0
 * @param ms
 */
export function get_day(ms = Date.now()): number {
  return Math.floor(ms / D_MS);
}
