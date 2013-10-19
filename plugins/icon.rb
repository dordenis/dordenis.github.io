module Jekyll

    class Icon < Liquid::Tag
   
        def initialize(tag_name, text, token)
            super
            @text = text.strip
        end

        def render(context)
            if @text
                "<i class='icon-fixed-width icon-#{@text}'></i>"
            else
                "Error not found icon"
            end
        end
    
    end

end

Liquid::Template.register_tag('icon', Jekyll::Icon)


