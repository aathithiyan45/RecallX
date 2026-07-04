from threading import Timer


class Debouncer:

    def __init__(self, delay=1.0):

        self.delay = delay
        self.timers = {}

    def debounce(self, key, callback):

        if key in self.timers:
            self.timers[key].cancel()

        timer = Timer(
            self.delay,
            callback
        )

        self.timers[key] = timer

        timer.start()


debouncer = Debouncer()