/**
 * Created by ASUS on 22.05.2014.
 */
$.extend(true, $.fn.DataTable.TableTools.classes, {
    "container": "DTTT ",
    "buttons": {
        "normal": "btn btn-white",
        "disabled": "disabled"
    },
    "collection": {
        "container": "DTTT_dropdown dropdown-menu",
        "buttons": {
            "normal": "",
            "disabled": "disabled"
        }
    },
    "print": {
        "info": "DTTT_print_info modal"
    },
    "select": {
        "row": "active"
    }
});

// Have the collection use a bootstrap compatible dropdown
$.extend(true, $.fn.DataTable.TableTools.classes, {
    "container": "DTTT ",
    "buttons": {
        "normal": "btn btn-white",
        "disabled": "disabled"
    },
    "collection": {
        "container": "DTTT_dropdown dropdown-menu",
        "buttons": {
            "normal": "",
            "disabled": "disabled"
        }
    },
    "print": {
        "info": "DTTT_print_info modal"
    },
    "select": {
        "row": "active"
    }
});

// Have the collection use a bootstrap compatible dropdown
$.extend(true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
    "collection": {
        "container": "ul",
        "button": "li",
        "liner": "a"
    }
});