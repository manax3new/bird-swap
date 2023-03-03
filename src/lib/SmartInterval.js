export default function(callbackFunc, timing) {
    const variableInterval = {
        interval: timing,
        callback: callbackFunc,
        stopped: false,
        runLoop: function() {
            if (variableInterval.stopped) return;
            const result = variableInterval.callback.call(variableInterval);
            if (typeof result == 'number')
            {
                if (result === 0) return;
                variableInterval.interval = result;
            }
            variableInterval.loop();
        },
        stop: function() {
            this.stopped = true;
            clearTimeout(this.timeout);
        },
        start: function() {
            this.stopped = false;
            return this.loop();
        },
        loop: function() {
            this.timeout = setTimeout(this.runLoop, this.interval);
            return this;
        }
    };
  
    return variableInterval.start();
}