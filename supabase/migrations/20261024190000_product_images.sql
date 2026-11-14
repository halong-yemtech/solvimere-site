with images(name, old_image, new_image) as (
  values
    ('AI Agent Platform', '/images/photos/insight-ml.jpg', '/images/products/agentco.webp'),
    ('AI Workflow Automation', '/images/photos/laptop.jpg', '/images/products/agentlabs.jpg'),
    ('AI Marketing Agent', '/images/photos/insight-product.jpg', '/images/products/hyperloop.png'),
    ('AI Voice Agent', '/images/photos/session.jpg', '/images/products/zencia.png'),
    ('AI Contract Analyzer', '/images/photos/work.webp', '/images/products/unicoconnect.png'),
    ('Sim', '/images/photos/engineer.png', '/images/products/sim.png'),
    ('Bluejay', '/images/photos/insight-vision.jpg', '/images/products/bluejay.jpg'),
    ('AgentMail', '/images/photos/laptop.jpg', '/images/products/agentmail.png'),
    ('Yutori', '/images/photos/robot.jpg', '/images/products/yutori.png'),
    ('Lapis', '/images/photos/retail.jpg', '/images/products/lapis.png'),
    ('Context.dev', '/images/photos/inspection.jpg', '/images/products/context-dev.png')
)
update public.pages p
set content = jsonb_set(p.content, '{items}', (
  select jsonb_agg(
    case when i.new_image is not null
      then item || jsonb_build_object('image', i.new_image)
      else item
    end order by ord)
  from jsonb_array_elements(p.content->'items') with ordinality as e(item, ord)
  left join images i on i.name = item->>'name' and i.old_image = item->>'image'
))
where p.slug = 'products' and jsonb_typeof(p.content->'items') = 'array';
