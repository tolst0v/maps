import { Box, Stack, Typography } from '@mui/joy';
import { forwardRef } from 'react';

// TODO make units more explicit via prop.

export const SpeedLimit = forwardRef(
  (
    props: {
      limitMph?: number;
      speedMph: number;
      limitKph?: number;
      gameTimeMinutes?: number;
      nextRestStopMs?: number;
    },
    ref,
  ) => {
    const limitSign =
      props.limitMph != null ? (
        <SpeedLimitMph limitMph={props.limitMph} ref={ref} />
      ) : props.limitKph != null ? (
        <SpeedLimitKph limitKph={props.limitKph} ref={ref} />
      ) : null;

    const effectiveLimit =
      (props.limitMph ?? 0) < 5 ? Infinity : (props.limitMph ?? 0);
    const ratio = props.speedMph / effectiveLimit;
    const color = ratio <= 1 ? 'white' : ratio <= 1.1 ? 'orange' : 'red';

    const gameTime =
      props.gameTimeMinutes == null
        ? undefined
        : toClockString(props.gameTimeMinutes);
    const nextRestStop =
      props.nextRestStopMs == null
        ? undefined
        : toDurationString(props.nextRestStopMs);

    return (
      <Stack
        display={'grid'}
        gridTemplateColumns={'1fr 1fr'}
        gap={0.25}
        sx={{
          backgroundColor: '#000',
          p: 0.25,
        }}
        borderRadius={4}
      >
        {limitSign}
        <Stack justifyContent={'center'}>
          <Typography
            textAlign={'center'}
            level={'title-lg'}
            fontSize={'xl2'}
            fontWeight={'bold'}
            sx={{
              color,
              WebkitTextStroke: 1.25,
            }}
          >
            {Math.round(props.speedMph) || '--'}
          </Typography>
          <Typography
            textAlign={'center'}
            lineHeight={1}
            level={'body-md'}
            sx={{ color }}
          >
            mph
          </Typography>
        </Stack>
        {gameTime ? (
          <Stack
            gridColumn={limitSign ? '2' : '1 / -1'}
            alignItems={'center'}
            gap={0.25}
          >
            <Typography
              textAlign={'center'}
              level={'body-sm'}
              fontWeight={'bold'}
              lineHeight={1.2}
              sx={{
                color: 'white',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {gameTime}
            </Typography>
            {nextRestStop ? (
              <Typography
                textAlign={'center'}
                level={'body-xs'}
                lineHeight={1}
                sx={{
                  color: 'white',
                  opacity: 0.85,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Sleep in {nextRestStop}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    );
  },
);

function toClockString(totalMinutes: number): string {
  const minutesInDay = 24 * 60;
  const normalizedMinutes =
    ((Math.floor(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours24 = Math.floor(normalizedMinutes / 60);
  const hours12 = hours24 % 12 || 12;
  const minutes = normalizedMinutes % 60;
  const period = hours24 < 12 ? 'AM' : 'PM';
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function toDurationString(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

const SpeedLimitMph = forwardRef((props: { limitMph: number }, ref) => (
  <Box
    boxShadow={'0 0 2px 0 #0008'}
    padding={0.25}
    borderRadius={4}
    sx={{ backgroundColor: 'white' }}
    ref={ref}
  >
    <Box
      border={2}
      borderColor={'common.black'}
      padding={0.5}
      paddingBottom={0}
      borderRadius={4}
    >
      <Typography
        textAlign={'center'}
        lineHeight={1.2}
        level={'body-xs'}
        sx={{ color: 'common.black' }}
      >
        SPEED
        <br />
        LIMIT
      </Typography>
      <Typography
        textAlign={'center'}
        level={'title-lg'}
        fontSize={'xl2'}
        fontWeight={'bold'}
        sx={{
          color: 'common.black',
          WebkitTextStroke: 1.25,
        }}
      >
        {props.limitMph < 5 ? '--' : props.limitMph}
      </Typography>
    </Box>
  </Box>
));

const SpeedLimitKph = forwardRef((props: { limitKph: number }, ref) => (
  <Box
    boxShadow={'0 0 2px 0 #0004'}
    padding={0.2}
    borderRadius={'50%'}
    border={1}
    borderColor={'#f22'}
    sx={{ backgroundColor: 'white' }}
    ref={ref}
  >
    <Box
      display={'flex'}
      alignItems={'center'}
      border={6}
      borderColor={'#f22'}
      padding={1}
      borderRadius={'50%'}
      sx={{
        aspectRatio: 1,
      }}
    >
      <Typography
        textAlign={'center'}
        level={'title-lg'}
        fontSize={'xl2'}
        fontWeight={'bold'}
        sx={{
          color: 'common.black',
          WebkitTextStroke: 1.25,
        }}
      >
        {props.limitKph}
      </Typography>
    </Box>
  </Box>
));
